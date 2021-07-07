use std::{env, io::Error};

use futures_util::StreamExt;
use log::info;
use tokio::net::{TcpListener};
use std::net::TcpStream;

mod inc;
mod fs;
mod proto;
mod backing;
mod test;
mod db;

use proto::*;

use inc::{IncSpawner, Session};
use std::collections::HashMap;



use tungstenite::{server::accept, WebSocket, Message};

use lazy_static::lazy_static;

use std::io::{Read, Write};

lazy_static! {
  static ref INC_SPAWNER: IncSpawner = IncSpawner::new();
}

trait WebSocketExt {
  fn write_res(&mut self, res: Res) -> tungstenite::Result<()>;
}

impl<T: Read + Write> WebSocketExt for WebSocket<T> {
  fn write_res(&mut self, res: Res) -> tungstenite::Result<()> {
    self.write_message(res.as_ws_msg())
  }
}

async fn accept_connection(mut websocket: WebSocket<TcpStream>) -> anyhow::Result<()> {
  let mut handle_iter = 0u64;
  let mut files = HashMap::new();
  
  loop {
    let msg = websocket.read_message()?;

    // Get text from message (could also be binary). If we fail, silently ignore.
    let text = match msg.to_text() {
      Ok(text) => text,
      _ => continue
    };

    // Parse request from the JSON. If we fail, silently ignore.
    let req = match serde_json::from_str::<Req>(text) {
      Ok(req) => req,
      _ => continue
    };
    
    let _ = match &req.kind {
      ReqKind::Open(OpenReq { path }) => {
        // Open a session and store it
        match INC_SPAWNER.spawn(path).await {
          Ok(session) => {
            handle_iter += 1;
            files.insert(handle_iter, session);
            websocket.write_res(req.reply(OpenRes::success(handle_iter, )))
          },
          Err(e) => websocket.write_res(req.reply(OpenRes::error(e)))
        }
      },
      ReqKind::Update(UpdateReq { handle, code }) => {
        match files.get_mut(handle) {
          Some(session) => match session.update(code.clone()).await {
            Ok(messages) => websocket.write_res(req.reply(UpdateRes::success(messages))),
            Err(e) => websocket.write_res(req.reply(UpdateRes::error(e)))
          },
          None => websocket.write_res(req.reply(UpdateRes::error("No such file")))
        }
      },
      ReqKind::Close(CloseReq { handle }) => {
        match files.remove(handle) {
          Some(_) => websocket.write_res(req.reply(CloseRes::success())),
          None => websocket.write_res(req.reply(UpdateRes::error("No such file")))
        }
      }
    };
  }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {

  let _ = env_logger::try_init();
  let addr = env::args().nth(1).unwrap_or_else(|| "127.0.0.1:8000".to_string());

  // Create the event loop and TCP listener we'll accept connections on.
  let try_socket = TcpListener::bind(&addr).await;
  let listener = try_socket.expect("Failed to bind");
  info!("Listening on: {}", addr);

  let mut session = INC_SPAWNER.spawn("C:\\Users\\Semio\\ivygate\\test.cpp").await.unwrap();
  println!("{:?}", session.update(None).await?);

  loop {
    let (stream, addr) = listener.accept().await?;
    let stream = stream.into_std()?;
    stream.set_nonblocking(false)?;
    let websocket = accept(stream)?;
    
    std::thread::spawn(move || {
      let rt = tokio::runtime::Runtime::new().unwrap();
      rt.block_on(accept_connection(websocket)).unwrap();
    });
  }

  Ok(())
}
