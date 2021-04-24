use serde::{Serialize, Deserialize};

use std::path::PathBuf;
use crate::inc::Message;

use derive_more::*;

use std::fmt::Display;

#[derive(Serialize, Deserialize)]
pub struct OpenReq {
  pub path: PathBuf
}

#[derive(Serialize, Deserialize)]
pub struct UpdateReq {
  pub handle: u64,
  pub code: Option<String>
}

#[derive(Serialize, Deserialize)]
pub struct CloseReq {
  pub handle: u64
}

#[derive(From, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ReqKind {
  #[from]
  Open(OpenReq),
  #[from]
  Update(UpdateReq),
  #[from]
  Close(CloseReq)
}

#[derive(Serialize, Deserialize)]
pub struct Req {
  pub id: u64,
  pub kind: ReqKind
}

impl Req {
  pub fn reply<K: Into<ResKind>>(&self, kind: K) -> Res {
    Res {
      id: self.id,
      kind: kind.into()
    }
  }
}

#[derive(Serialize, Deserialize)]
pub struct OpenRes {
  pub success: bool,
  pub error: Option<String>,
  pub handle: Option<u64>
}

impl OpenRes {
  pub fn success(handle: u64) -> Self {
    Self {
      success: true,
      error: None,
      handle: Some(handle)
    }
  }

  pub fn error<E: Display>(error: E) -> Self {
    Self {
      success: false,
      error: Some(error.to_string()),
      handle: None
    }
  }
}

#[derive(Serialize, Deserialize)]
pub struct UpdateRes {
  pub success: bool,
  pub error: Option<String>,
  pub messages: Option<Vec<Message>>
}

impl UpdateRes {
  pub fn success(messages: Vec<Message>) -> Self {
    Self {
      success: true,
      error: None,
      messages: Some(messages)
    }
  }

  pub fn error<E: Display>(error: E) -> Self {
    Self {
      success: false,
      error: Some(error.to_string()),
      messages: None
    }
  }
}

#[derive(Serialize, Deserialize)]
pub struct CloseRes {
  pub success: bool,
  pub error: Option<String>
}

impl CloseRes {
  pub fn success() -> Self {
    Self {
      success: true,
      error: None,
    }
  }

  pub fn error<E: Display>(error: E) -> Self {
    Self {
      success: false,
      error: Some(error.to_string())
    }
  }
}

#[derive(From, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ResKind {
  #[from]
  Open(OpenRes),
  #[from]
  Update(UpdateRes),
  #[from]
  Close(CloseRes)
}

#[derive(Serialize, Deserialize)]
pub struct Res {
  pub id: u64,
  pub kind: ResKind
}

impl Res {
  pub fn as_ws_msg(&self) -> tungstenite::Message {
    tungstenite::Message::Text(serde_json::to_string(&self).unwrap())
  }
}

#[derive(Serialize, Deserialize)]
pub enum Msg {
  Req(Req),
  Res(Res)
}