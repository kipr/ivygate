import * as message from './message';

export namespace Proto {
  

  export interface OpenReq {
    type: 'open';
    path: string;
  }

  export interface UpdateReq {
    type: 'update';
    handle: number;
    code?: string;
  }

  export interface CloseReq {
    type: 'close';
    handle: number;
  }

  export type ReqKind = OpenReq | UpdateReq | CloseReq;

  export interface Req {
    id: number;
    kind: ReqKind;
  }

  export interface OpenRes {
    type: 'open';
    success: boolean;
    error?: string;
    handle?: number;
  }

  export namespace OpenRes {
    export const resolveReject = (data: OpenRes, ret: ResolveReject) => {
      if (!data.success) {
        ret.reject(data.error);
        return;
      }

      ret.resolve(data.handle);
    };
  }

  export interface UpdateRes {
    type: 'update';
    success: boolean;
    error?: string;
    messages?: message.Message[];
  }

  export namespace UpdateRes {
    export const resolveReject = (data: UpdateRes, ret: ResolveReject) => {
      if (!data.success) {
        ret.reject(data.error);
        return;
      }

      ret.resolve(data.messages);
    };
  }

  export interface CloseRes {
    type: 'close';
    success: boolean;
  }

  export namespace CloseRes {
    export const resolveReject = (data: CloseRes, ret: ResolveReject) => {
      if (!data.success) {
        ret.reject("Failure");
        return;
      }

      ret.resolve();
    };
  }

  export type ResKind = OpenRes | UpdateRes | CloseRes;

  export namespace ResKind {
    export const resolveReject = (data: ResKind, ret: ResolveReject) => {
      switch (data.type) {
        case 'open': return OpenRes.resolveReject(data, ret);
        case 'update': return UpdateRes.resolveReject(data, ret);
        case 'close': return CloseRes.resolveReject(data, ret);
      }
    };
  }

  export interface Res {
    id: number;
    kind: ResKind;
  }

  export namespace Res {
    export const resolveReject = (data: Res, ret: ResolveReject) => ResKind.resolveReject(data.kind, ret);
  }

  export type Msg = Req | Res;
}

interface ResolveReject<T = any> {
  resolve: (value?: T) => void;
  reject: (err: any) => void;
}

class Server {
  private iter_ = 0;
  private pending_: { [id: number]: ResolveReject } = {};
  private socket_: WebSocket;

  connect(url: string) {
    this.socket_ = new WebSocket(url);

    this.socket_.onopen = this.onOpen_;
    this.socket_.onmessage = this.onMessage_;
    this.socket_.onclose = this.onClose_;
  }
  
  open(path: string) {
    return this.request<Proto.OpenRes>({
      type: 'open',
      path
    }); 
  }

  update(handle: number) {
    return this.request<message.Message[]>({
      type: 'update',
      handle
    });
  }

  close(handle: number) {
    return this.request<void>({
      type: 'close',
      handle
    });
  }

  request<T>(req: Proto.ReqKind): Promise<T> {
    if (this.socket_.readyState != WebSocket.OPEN) return null;
    
    ++this.iter_;

    this.socket_.send(JSON.stringify(req));
    
    return new Promise<T>((resolve, reject) => {
      this.pending_[this.iter_] = { resolve, reject };
    });
  }

  private onOpen_ = (ev: Event) => {
  };

  private onMessage_ = (ev: MessageEvent) => {
    let res: Proto.Res = JSON.parse(ev.data);
    
    if (!(res.id in this.pending_)) return;
    Proto.Res.resolveReject(res, this.pending_[res.id]);
    delete this.pending_[res.id];
  };

  private onClose_ = (ev: Event) => {
    const keys = Object.keys(this.pending_);

    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      this.pending_[key].reject("Connection closed");
    }

    this.pending_ = {};
  };
}

export default new Server;