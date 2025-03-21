export interface Peer {
  id: string;
  stream: MediaStream;
}

export interface Room {
  id: string;
  peers: Peer[];
}