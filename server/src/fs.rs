pub fn tmp_dir() -> std::path::PathBuf {
  let mut dir = std::env::temp_dir();
  dir.push("ivygate");
  dir
}