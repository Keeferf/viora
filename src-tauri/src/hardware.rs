// Hardware detection (camera / microphone / speaker) for the media settings UI.
//
// Dependency-free on purpose: each OS already ships a tool that reports this,
// so we shell out to the native one and parse its output. A failed probe
// reports no devices instead of erroring, so the UI can always render.
//
// `any(target_os = "...", test)` keeps every platform's parser compiled under
// `cargo test` so they can be verified on any host, not just their own OS.

use serde::Serialize;

#[derive(Debug, Clone, Default, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HardwareInfo {
    pub cameras: Vec<String>,
    pub microphones: Vec<String>,
    pub speakers: Vec<String>,
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
    use std::{env, fs, path::Path, process::Command};

    pub fn detect() -> HardwareInfo {
        let pcm = fs::read_to_string("/proc/asound/pcm").unwrap_or_default();
        let (mut microphones, mut speakers) = parse_asound_pcm(&pcm);

        // WSL2 has no ALSA; WSLg bridges Windows audio over PulseAudio instead.
        if microphones.is_empty() && speakers.is_empty() {
            let (pulse_microphones, pulse_speakers) = pulse_audio_names();
            microphones = pulse_microphones;
            speakers = pulse_speakers;
        }

        HardwareInfo {
            cameras: camera_names(),
            microphones,
            speakers,
        }
    }

    /// Audio bridged by WSLg (or any host exporting a PulseAudio server) when
    /// ALSA is unavailable. Real names need `pactl`; otherwise report the
    /// generic WSLg endpoints so the dropdown is not empty.
    fn pulse_audio_names() -> (Vec<String>, Vec<String>) {
        let has_pulse_server =
            Path::new("/mnt/wslg/PulseServer").exists() || env::var_os("PULSE_SERVER").is_some();
        if !has_pulse_server {
            return (Vec::new(), Vec::new());
        }

        let microphones = parse_pactl_short(&pactl("sources"));
        let speakers = parse_pactl_short(&pactl("sinks"));
        if microphones.is_empty() && speakers.is_empty() {
            return (
                vec!["WSL audio input".to_string()],
                vec!["WSL audio output".to_string()],
            );
        }
        (microphones, speakers)
    }

    fn pactl(kind: &str) -> String {
        Command::new("pactl")
            .args(["list", "short", kind])
            .output()
            .map(|output| String::from_utf8_lossy(&output.stdout).into_owned())
            .unwrap_or_default()
    }

    /// `pactl list short` rows are tab separated: `index<TAB>name<TAB>...`.
    fn parse_pactl_short(output: &str) -> Vec<String> {
        output
            .lines()
            .filter_map(|line| line.split('\t').nth(1))
            .map(str::trim)
            .filter(|name| !name.is_empty() && !name.contains(".monitor"))
            .map(str::to_owned)
            .collect()
    }

    /// Real camera names live in sysfs; fall back to the raw `/dev/videoN` name.
    fn camera_names() -> Vec<String> {
        if let Ok(entries) = fs::read_dir("/sys/class/video4linux") {
            let mut names: Vec<String> = entries
                .filter_map(Result::ok)
                .filter_map(|entry| {
                    let file = entry.file_name().to_string_lossy().into_owned();
                    if !file.starts_with("video") {
                        return None;
                    }
                    let sys_name =
                        fs::read_to_string(format!("/sys/class/video4linux/{file}/name"))
                            .ok()
                            .map(|name| name.trim().to_string())
                            .filter(|name| !name.is_empty());
                    Some(sys_name.unwrap_or(file))
                })
                .collect();
            names.sort();
            if !names.is_empty() {
                return names;
            }
        }
        dev_video_names(Path::new("/dev"))
    }

    fn dev_video_names(dir: &Path) -> Vec<String> {
        let Ok(entries) = fs::read_dir(dir) else {
            return Vec::new();
        };
        let mut names: Vec<String> = entries
            .filter_map(Result::ok)
            .map(|entry| entry.file_name().to_string_lossy().into_owned())
            .filter(|name| name.starts_with("video"))
            .collect();
        names.sort();
        names
    }

    /// `/proc/asound/pcm` lines look like:
    /// `00-00: ALC269 Analog : playback 1 : capture 1`
    /// A card can appear in both lists when it does playback and capture.
    fn parse_asound_pcm(pcm: &str) -> (Vec<String>, Vec<String>) {
        let mut microphones = Vec::new();
        let mut speakers = Vec::new();
        for line in pcm.lines() {
            let name = line.split(':').nth(1).map(str::trim).unwrap_or_default();
            if name.is_empty() {
                continue;
            }
            let lower = line.to_ascii_lowercase();
            if lower.contains("capture") {
                microphones.push(name.to_string());
            }
            if lower.contains("playback") {
                speakers.push(name.to_string());
            }
        }
        (microphones, speakers)
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn parses_capture_and_playback() {
            let sample =
                "00-00: ALC269 Analog : playback 1 : capture 1\n01-00: HDMI : playback 1\n";
            let (microphones, speakers) = parse_asound_pcm(sample);
            assert_eq!(microphones, vec!["ALC269 Analog"]);
            assert_eq!(speakers, vec!["ALC269 Analog", "HDMI"]);
            assert_eq!(parse_asound_pcm(""), (Vec::new(), Vec::new()));
        }

        #[test]
        fn parses_pactl_short_names() {
            let sample = "0\talsa_output.pci-1.analog-stereo\tmodule.c\ts16le\tRUNNING\n1\talsa_output.pci-1.analog-stereo.monitor\tmodule.c\ts16le\tIDLE\n2\tRDPSink\tmodule.c\ts16le\tRUNNING\n";
            assert_eq!(
                parse_pactl_short(sample),
                vec!["alsa_output.pci-1.analog-stereo", "RDPSink"]
            );
            assert!(parse_pactl_short("").is_empty());
        }
    }
}

#[cfg(any(target_os = "macos", test))]
#[allow(dead_code)]
mod macos {
    use super::HardwareInfo;
    use std::process::Command;

    pub fn detect() -> HardwareInfo {
        let cameras = profiler("SPCameraDataType")
            .as_deref()
            .map(camera_names)
            .unwrap_or_default();
        let (microphones, speakers) = profiler("SPAudioDataType")
            .as_deref()
            .map(audio_names)
            .unwrap_or_default();
        HardwareInfo {
            cameras,
            microphones,
            speakers,
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

    fn camera_names(json: &str) -> Vec<String> {
        let Ok(value) = serde_json::from_str::<serde_json::Value>(json) else {
            return Vec::new();
        };
        value["SPCameraDataType"]
            .as_array()
            .map(|cameras| {
                cameras
                    .iter()
                    .filter_map(|camera| camera["_name"].as_str().map(str::to_owned))
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Audio devices are nested one level down under `_items`. Direction shows
    /// up either as a `coreaudio_device_input`/`output` key or in the name.
    fn audio_names(json: &str) -> (Vec<String>, Vec<String>) {
        let Ok(value) = serde_json::from_str::<serde_json::Value>(json) else {
            return (Vec::new(), Vec::new());
        };
        let Some(groups) = value["SPAudioDataType"].as_array() else {
            return (Vec::new(), Vec::new());
        };

        let mut microphones = Vec::new();
        let mut speakers = Vec::new();
        let devices = groups.iter().flat_map(|group| {
            group["_items"]
                .as_array()
                .map(Vec::as_slice)
                .unwrap_or(std::slice::from_ref(group))
        });
        for device in devices {
            let name = device["_name"].as_str().unwrap_or_default().to_string();
            if name.is_empty() {
                continue;
            }
            let keys = device
                .as_object()
                .map(|o| o.keys().cloned().collect::<Vec<_>>().join(" "))
                .unwrap_or_default()
                .to_ascii_lowercase();
            let lower = name.to_ascii_lowercase();
            if keys.contains("input") || lower.contains("microphone") || lower.contains("input") {
                microphones.push(name.clone());
            }
            if keys.contains("output") || lower.contains("speaker") || lower.contains("output") {
                speakers.push(name);
            }
        }
        (microphones, speakers)
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn detects_camera_names() {
            let json = r#"{"SPCameraDataType":[{"_name":"FaceTime HD Camera"}]}"#;
            assert_eq!(camera_names(json), vec!["FaceTime HD Camera"]);
            assert!(camera_names(r#"{"SPCameraDataType":[]}"#).is_empty());
            assert!(camera_names("not json").is_empty());
        }

        #[test]
        fn detects_audio_names_by_direction() {
            let json = r#"{"SPAudioDataType":[{"_name":"devices","_items":[
                {"_name":"MacBook Pro Microphone","coreaudio_device_input":1},
                {"_name":"MacBook Pro Speakers","coreaudio_device_output":1}
            ]}]}"#;
            let (microphones, speakers) = audio_names(json);
            assert_eq!(microphones, vec!["MacBook Pro Microphone"]);
            assert_eq!(speakers, vec!["MacBook Pro Speakers"]);

            let output_only = r#"{"SPAudioDataType":[{"_items":[{"_name":"Speakers","coreaudio_device_output":1}]}]}"#;
            let (microphones, speakers) = audio_names(output_only);
            assert!(microphones.is_empty());
            assert_eq!(speakers, vec!["Speakers"]);
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
        let (microphones, speakers) = classify_audio(&endpoints);
        HardwareInfo {
            cameras,
            microphones,
            speakers,
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
    fn classify_audio(endpoints: &[String]) -> (Vec<String>, Vec<String>) {
        let mut microphones = Vec::new();
        let mut speakers = Vec::new();
        for name in endpoints {
            let lower = name.to_ascii_lowercase();
            if ["microphone", "headset", "input"]
                .iter()
                .any(|needle| lower.contains(needle))
            {
                microphones.push(name.clone());
            }
            if ["speaker", "headphone", "headset", "output"]
                .iter()
                .any(|needle| lower.contains(needle))
            {
                speakers.push(name.clone());
            }
        }
        (microphones, speakers)
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
        fn classifies_audio_names_by_direction() {
            let endpoints = vec![
                "Microphone (Realtek)".to_string(),
                "Speakers (Realtek)".to_string(),
            ];
            let (microphones, speakers) = classify_audio(&endpoints);
            assert_eq!(microphones, vec!["Microphone (Realtek)"]);
            assert_eq!(speakers, vec!["Speakers (Realtek)"]);

            let (microphones, speakers) = classify_audio(&["Headset (Bluetooth)".to_string()]);
            assert_eq!(microphones, vec!["Headset (Bluetooth)"]);
            assert_eq!(speakers, vec!["Headset (Bluetooth)"]);

            assert_eq!(classify_audio(&[]), (Vec::new(), Vec::new()));
        }
    }
}
