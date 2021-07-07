use serde::{Serialize, Deserialize};

use std::path::PathBuf;
use crate::inc::Message;

use derive_more::*;

use std::fmt::Display;

use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub enum Ident {
  Username(String),
  Email(String)
}

impl Ident {
  pub fn username<S: Into<String>>(username: S) -> Self {
    Self::Username(username.into())
  }

  pub fn email<S: Into<String>>(email: S) -> Self {
    Self::Email(email.into())
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
  pub ident: Ident,
  pub password: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectBrief {
  pub uuid: Uuid,
  pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginReq {
  user: User
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListProjectsReq {

}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateProjectReq {
  pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteProjectReq {
  pub uuid: Uuid
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenProjectReq {
  pub uuid: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CloseProjectReq {
  pub uuid: Uuid,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateFileReq {
  pub project: Uuid,
  pub path: PathBuf,
  pub contents: Option<String>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteFileReq {
  pub project: Uuid,
  pub path: PathBuf,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenFileReq {
  pub project: Uuid,
  pub path: PathBuf,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateFileReq {
  pub handle: u64,
  pub code: Option<String>
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CloseFileReq {
  pub handle: u64
}

#[derive(Debug, From, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ReqKind {
  #[from]
  LoginReq(LoginReq),
  #[from]
  ListProjectsReq(ListProjectsReq),
  #[from]
  CreateProject(CreateProjectReq),
  #[from]
  DeleteProject(DeleteProjectReq),
  #[from]
  OpenProject(OpenProjectReq),
  #[from]
  CloseProject(CloseProjectReq),
  #[from]
  CreateFile(CreateFileReq),
  #[from]
  DeleteFile(DeleteFileReq),
  #[from]
  OpenFile(OpenFileReq),
  #[from]
  UpdateFile(UpdateFileReq),
  #[from]
  CloseFile(CloseFileReq)
}

#[derive(Debug, Serialize, Deserialize)]
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

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginRes {
  pub success: bool,
  pub error: Option<String>
}

impl LoginRes {
  pub fn success() -> Self {
    Self {
      success: true,
      error: None,
    }
  }

  pub fn error<E: Display>(error: E) -> Self {
    Self {
      success: false,
      error: Some(error.to_string()),
    }
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ListProjectsRes {
  pub success: bool,
  pub projects: Option<Vec<ProjectBrief>>,
  pub error: Option<String>
}

impl ListProjectsRes {
  pub fn success(projects: Vec<ProjectBrief>) -> Self {
    Self {
      success: true,
      projects: Some(projects),
      error: None,
    }
  }

  pub fn error<E: Display>(error: E) -> Self {
    Self {
      success: false,
      projects: None,
      error: Some(error.to_string()),
    }
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateFileRes {
  pub success: bool,
  pub uuid: Option<Uuid>,
  pub error: Option<String>
}

impl CreateFileRes {
  pub fn success(uuid: Uuid) -> Self {
    Self {
      success: true,
      uuid: Some(uuid),
      error: None,
    }
  }

  pub fn error<E: Display>(error: E) -> Self {
    Self {
      success: false,
      uuid: None,
      error: Some(error.to_string()),
    }
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DeleteFileRes {
  pub success: bool,
  pub contents: Option<String>,
  pub error: Option<String>
}

impl DeleteFileRes {
  pub fn success<S: Into<String>>(contents: S) -> Self {
    Self {
      success: true,
      contents: Some(contents.into()),
      error: None,
    }
  }

  pub fn error<E: Display>(error: E) -> Self {
    Self {
      success: false,
      contents: None,
      error: Some(error.to_string()),
    }
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenProjectRes {
  pub success: bool,
  pub error: Option<String>
}

impl OpenProjectRes {
  pub fn success() -> Self {
    Self {
      success: true,
      error: None,
    }
  }

  pub fn error<E: Display>(error: E) -> Self {
    Self {
      success: false,
      error: Some(error.to_string()),
    }
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CloseProjectRes {
  pub success: bool,
  pub error: Option<String>
}

impl CloseProjectRes {
  pub fn success() -> Self {
    Self {
      success: true,
      error: None,
    }
  }

  pub fn error<E: Display>(error: E) -> Self {
    Self {
      success: false,
      error: Some(error.to_string()),
    }
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OpenFileRes {
  pub success: bool,
  pub error: Option<String>,
  pub contents: Option<String>,
  pub handle: Option<u64>
}

impl OpenFileRes {
  pub fn success<C: Into<String>>(handle: u64, contents: C) -> Self {
    Self {
      success: true,
      error: None,
      contents: Some(contents.into()),
      handle: Some(handle)
    }
  }

  pub fn error<E: Display>(error: E) -> Self {
    Self {
      success: false,
      error: Some(error.to_string()),
      contents: None,
      handle: None
    }
  }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateFileRes {
  pub success: bool,
  pub error: Option<String>,
  pub messages: Option<Vec<Message>>
}

impl UpdateFileRes {
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

#[derive(Debug, Serialize, Deserialize)]
pub struct CloseFileRes {
  pub success: bool,
  pub error: Option<String>
}

impl CloseFileRes {
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

#[derive(Debug, From, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ResKind {
  #[from]
  Login(LoginRes),
  #[from]
  ListProjects(ListProjectsRes),
  #[from]
  OpenProject(OpenProjectRes),
  #[from]
  CloseProject(CloseProjectRes),
  #[from]
  CreateFile(CreateFileRes),
  #[from]
  DeleteFile(DeleteFileRes),
  #[from]
  OpenFile(OpenFileRes),
  #[from]
  UpdateFile(UpdateFileRes),
  #[from]
  CloseFile(CloseFileRes)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Res {
  pub id: u64,
  pub kind: ResKind
}

impl Res {
  pub fn as_ws_msg(&self) -> tungstenite::Message {
    tungstenite::Message::Text(serde_json::to_string(&self).unwrap())
  }
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Msg {
  Req(Req),
  Res(Res)
}