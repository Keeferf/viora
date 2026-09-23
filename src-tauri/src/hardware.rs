// Hardware presence detection (camera / microphone / speaker).
//
// Dependency-free on purpose: each OS already ships a tool that reports this,
// so we shell out to the native one and parse its output. A failed probe
// reports "absent" instead of erroring, so the UI can always render.
//
// `any(target_os = "...", test)` keeps every platform's parser compiled under
// `cargo test` so they can be verified on any host, not just their own OS.

use serde::Serialize;

#[derive(Debug, Clone, Default, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HardwareInfo {
    pub has_camera: bool,
    pub has_microphone: bool,
    pub has_speaker: bool,
}

#[tauri::command]
pub async fn detect_hardware() -> HardwareInfo {
    #[cfg(target_os = "linux")]
    return linux::detect();
    #[cfg(target_os = "macos")]
    return macos::detect();
    #[cfg(target_os = "windows")]
    return windows::detect();
    #[cfg(not(any(target_os = "linux", target_os = "macos", target_os = "windows")))]
    return HardwareInfo::default();
}

#[cfg(any(target_os = "linux", test))]
mod linux {
    use super::HardwareInfo;
    use std::{fs, path::Path};

    pub fn detect() -> HardwareInfo {
        let pcm = fs::read_to_string("/proc/asound/pcm").unwrap_or_default();
        let (has_microphone, has_speaker) = parse_asound_pcm(&pcm);
        HardwareInfo {
            has_camera: has_video_device(Path::new("/dev")),
            has_microphone,
            has_speaker,
        }
    }

    fn has_video_device(dir: &Path) -> bool {
        fs::read_dir(dir)
            .map(|entries| {
                entries
                    .filter_map(Result::ok)
                    .any(|e| e.file_name().to_string_lossy().starts_with("video"))
            })
            .unwrap_or(false)
    }

    /// `/proc/asound/pcm` lines look like:
    /// `00-00: ALC269 Analog : playback 1 : capture 1`
    fn parse_asound_pcm(pcm: &str) -> (bool, bool) {
        let mut microphone = false;
        let mut speaker = false;
        for line in pcm.lines() {
            let line = line.to_ascii_lowercase();
            microphone |= line.contains("capture");
            speaker |= line.contains("playback");
        }
        (microphone, speaker)
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn parses_capture_and_playback() {
            let sample =
                "00-00: ALC269 Analog : playback 1 : capture 1\n01-00: HDMI : playback 1\n";
            assert_eq!(parse_asound_pcm(sample), (true, true));
            assert_eq!(
                parse_asound_pcm("01-00: HDMI : playback 1\n"),
                (false, true)
            );
            assert_eq!(parse_asound_pcm(""), (false, false));
        }
    }
}

#[cfg(any(target_os = "macos", test))]
#[allow(dead_code)]
mod macos {
    use super::HardwareInfo;
    use std::process::Command;

    pub fn detect() -> HardwareInfo {
        let (has_microphone, has_speaker) = profiler("SPAudioDataType")
            .as_deref()
            .map(parse_audio)
            .unwrap_or((false, false));
        let has_camera = profiler("SPCameraDataType")
            .as_deref()
            .map(parse_camera)
            .unwrap_or(false);
        HardwareInfo {
            has_camera,
            has_microphone,
            has_speaker,
        }
    }

    fn profiler(data_type: &str) -> Option<String> {
        let output = Command::new("system_profiler")
            .args(["-json", data_type])
            .output()
            .ok()?;
        output
            .status
            .success()
            .then(|| String::from_utf8_lossy(&output.stdout).into_owned())
    }

    fn parse_camera(json: &str) -> bool {
        let value: serde_json::Value = match serde_json::from_str(json) {
            Ok(value) => value,
            Err(_) => return false,
        };
        value["SPCameraDataType"]
            .as_array()
            .map(|cameras| !cameras.is_empty())
            .unwrap_or(false)
    }

    /// Audio devices are nested one level down under `_items`. Direction shows
    /// up either as a `coreaudio_device_input`/`output` key or in the name.
    fn parse_audio(json: &str) -> (bool, bool) {
        let value: serde_json::Value = match serde_json::from_str(json) {
            Ok(value) => value,
            Err(_) => return (false, false),
        };
        let Some(groups) = value["SPAudioDataType"].as_array() else {
            return (false, false);
        };

        let mut microphone = false;
        let mut speaker = false;
        for device in groups.iter().flat_map(|group| {
            group["_items"]
                .as_array()
                .map(Vec::as_slice)
                .unwrap_or(std::slice::from_ref(group))
        }) {
            let name = device["_name"]
                .as_str()
                .unwrap_or_default()
                .to_ascii_lowercase();
            let keys = device
                .as_object()
                .map(|o| o.keys().cloned().collect::<Vec<_>>().join(" "))
                .unwrap_or_default()
                .to_ascii_lowercase();
            microphone |=
                keys.contains("input") || name.contains("microphone") || name.contains("input");
            speaker |=
                keys.contains("output") || name.contains("speaker") || name.contains("output");
        }
        (microphone, speaker)
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn detects_camera_from_items() {
            assert!(parse_camera(
                r#"{"SPCameraDataType":[{"_name":"FaceTime HD Camera"}]}"#
            ));
            assert!(!parse_camera(r#"{"SPCameraDataType":[]}"#));
            assert!(!parse_camera("not json"));
        }

        #[test]
        fn detects_audio_directions() {
            let json = r#"{"SPAudioDataType":[{"_name":"devices","_items":[
                {"_name":"MacBook Pro Microphone","coreaudio_device_input":1},
                {"_name":"MacBook Pro Speakers","coreaudio_device_output":1}
            ]}]}"#;
            assert_eq!(parse_audio(json), (true, true));

            let output_only = r#"{"SPAudioDataType":[{"_items":[{"_name":"Speakers","coreaudio_device_output":1}]}]}"#;
            assert_eq!(parse_audio(output_only), (false, true));
            assert_eq!(parse_audio(r#"{"SPAudioDataType":[]}"#), (false, false));
        }
    }
}

#[cfg(any(target_os = "windows", test))]
#[allow(dead_code)]
mod windows {
    use super::HardwareInfo;
    use serde_json::Value;
    use std::process::Command;

    pub fn detect() -> HardwareInfo {
        let cameras = names(&powershell(
            "Get-PnpDevice -PresentOnly -ErrorAction SilentlyContinue | Where-Object { $_.Class -eq 'Camera' -or $_.Class -eq 'Image' } | Select-Object -ExpandProperty FriendlyName | ConvertTo-Json -Compress",
        ));
        let endpoints = names(&powershell(
            "Get-PnpDevice -PresentOnly -Class AudioEndpoint -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FriendlyName | ConvertTo-Json -Compress",
        ));
        let (has_microphone, has_speaker) = classify_audio(&endpoints);
        HardwareInfo {
            has_camera: !cameras.is_empty(),
            has_microphone,
            has_speaker,
        }
    }

    fn powershell(script: &str) -> String {
        Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-Command", script])
            .output()
            .map(|output| String::from_utf8_lossy(&output.stdout).into_owned())
            .unwrap_or_default()
    }

    /// `ConvertTo-Json` emits a bare string for one device and an array for many.
    fn names(json: &str) -> Vec<String> {
        match serde_json::from_str::<Value>(json.trim()) {
            Ok(Value::Array(items)) => items
                .iter()
                .filter_map(|item| item.as_str().map(str::to_owned))
                .collect(),
            Ok(Value::String(name)) => vec![name],
            _ => Vec::new(),
        }
    }

    // ponytail: Windows exposes no direction flag on AudioEndpoint, so classify
    // by name keywords. Localized names may need per-locale keywords later.
    fn classify_audio(endpoints: &[String]) -> (bool, bool) {
        let matches = |needles: &[&str]| {
            endpoints.iter().any(|name| {
                let name = name.to_ascii_lowercase();
                needles.iter().any(|needle| name.contains(needle))
            })
        };
        (
            matches(&["microphone", "headset", "input"]),
            matches(&["speaker", "headphone", "headset", "output"]),
        )
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn parses_single_and_multiple_names() {
            assert_eq!(names(r#""Camera One""#), vec!["Camera One"]);
            assert_eq!(
                names(r#"["Camera One","Camera Two"]"#),
                vec!["Camera One", "Camera Two"]
            );
            assert!(names("garbage").is_empty());
        }

        #[test]
        fn classifies_audio_directions() {
            let both = vec![
                "Microphone (Realtek)".to_string(),
                "Speakers (Realtek)".to_string(),
            ];
            assert_eq!(classify_audio(&both), (true, true));
            assert_eq!(
                classify_audio(&["Headset (Bluetooth)".to_string()]),
                (true, true)
            );
            assert_eq!(classify_audio(&[]), (false, false));
        }
    }
}
