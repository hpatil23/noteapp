use encoding_rs::{Encoding, UTF_8, WINDOWS_1252};

pub struct DecodedText {
    pub content: String,
    pub encoding: String,
    pub eol: String,
}

/// Detects a BOM or falls back to strict UTF-8, then Windows-1252, matching
/// the encodings Notepad++ commonly deals with for plain text files.
pub fn decode_bytes(bytes: &[u8]) -> DecodedText {
    if let Some(rest) = bytes.strip_prefix(&[0xEF, 0xBB, 0xBF]) {
        let (cow, _, _) = UTF_8.decode(rest);
        return finish(cow.into_owned(), "UTF-8 BOM");
    }
    if bytes.starts_with(&[0xFF, 0xFE]) {
        let enc = Encoding::for_label(b"utf-16le").unwrap();
        let (cow, _, _) = enc.decode(bytes);
        return finish(cow.into_owned(), "UTF-16 LE");
    }
    if bytes.starts_with(&[0xFE, 0xFF]) {
        let enc = Encoding::for_label(b"utf-16be").unwrap();
        let (cow, _, _) = enc.decode(bytes);
        return finish(cow.into_owned(), "UTF-16 BE");
    }

    match std::str::from_utf8(bytes) {
        Ok(s) => finish(s.to_string(), "UTF-8"),
        Err(_) => {
            let (cow, _, _) = WINDOWS_1252.decode(bytes);
            finish(cow.into_owned(), "Windows-1252")
        }
    }
}

fn finish(content: String, encoding: &str) -> DecodedText {
    let eol = if content.contains("\r\n") {
        "CRLF"
    } else {
        "LF"
    };
    DecodedText {
        content,
        encoding: encoding.to_string(),
        eol: eol.to_string(),
    }
}

/// Re-encodes text back into bytes for the given encoding label, mirroring
/// whatever encoding the file was originally decoded with.
pub fn encode_bytes(content: &str, encoding: &str) -> Vec<u8> {
    match encoding {
        "UTF-8 BOM" => {
            let mut out = vec![0xEF, 0xBB, 0xBF];
            out.extend_from_slice(content.as_bytes());
            out
        }
        "UTF-16 LE" => {
            let enc = Encoding::for_label(b"utf-16le").unwrap();
            let (bytes, _, _) = enc.encode(content);
            let mut out = vec![0xFF, 0xFE];
            out.extend_from_slice(&bytes);
            out
        }
        "UTF-16 BE" => {
            let enc = Encoding::for_label(b"utf-16be").unwrap();
            let (bytes, _, _) = enc.encode(content);
            let mut out = vec![0xFE, 0xFF];
            out.extend_from_slice(&bytes);
            out
        }
        "Windows-1252" => {
            let (bytes, _, _) = WINDOWS_1252.encode(content);
            bytes.into_owned()
        }
        _ => content.as_bytes().to_vec(),
    }
}
