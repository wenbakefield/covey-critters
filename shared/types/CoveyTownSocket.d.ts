export type TownJoinResponse = {
  /** Unique ID that represents this player * */
  userID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  sessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
  /** Current state of interactables in this town */
  interactables: Interactable[];
}

export type Interactable = ViewingArea | ConversationArea | PosterSessionArea | CarnivalGameArea;

export type TownSettingsUpdate = {
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

export type Direction = 'front' | 'back' | 'left' | 'right';
export interface Player {
  id: string;
  userName: string;
  location: PlayerLocation;
  pet?: Pet;
};

export type XY = { x: number, y: number };

export interface PlayerLocation {
  /* The CENTER x coordinate of this player's location */
  x: number;
  /* The CENTER y coordinate of this player's location */
  y: number;
  /** @enum {string} */
  rotation: Direction;
  moving: boolean;
  interactableID?: string;
};
export type ChatMessage = {
  author: string;
  sid: string;
  body: string;
  dateCreated: Date;
  interactableId?: string;
};

export type MovementType = 'offsetPlayer' | 'orbitPlayer' | 'followPlayer';

export type Species = 'black-bear' | 'brown-bear' | 'brown-cobra' | 'brown-mouse' | 'brown-sheep' | 'brown-snake' | 'brown-wolf' | 'dark-gray-wolf' | 'dark-wolf' | 'gray-mouse' | 'gray-wolf' | 'green-cobra' | 'green-snake' | 'light-wolf' | 'pigeon' | 'red-snake' | 'seagull' | 'white-mouse' | 'white-sheep';

export interface Pet {
  id: string;
  name: string;
  species: string;
  movementType: string;
  x: number;
  y: number;
  rotation: string;
}

export interface PetRule {
  percentileRangeMin: number; 
  percentileRangeMax: number;
  petSelection: Pet[];
}

export interface ConversationArea {
  id: string;
  topic?: string;
  occupantsByID: string[];
};

export interface GameSession {
  playerId: string,
  score: number,
  scoreLimit: number,
  isOver: boolean,
  timeLimit: number;
};

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface ViewingArea {
  id: string;
  video?: string;
  isPlaying: boolean;
  elapsedTimeSec: number;
}

export interface PosterSessionArea {
  id: string;
  stars: number;
  imageContents?: string;
  title?: string;
}

export interface CarnivalGameArea {
  id: string;
  petRule: PetRule[];
}

export interface PetOwnerMap {
  playerId: string
  pet: Pet
}


export interface ServerToClientEvents {
  playerMoved: (movedPlayer: Player) => void;
  petMoved: (petMoved: PetOwnerMap) => void;
  playerDisconnect: (disconnectedPlayer: Player) => void;
  playerJoined: (newPlayer: Player) => void;
  initialize: (initialData: TownJoinResponse) => void;
  townSettingsUpdated: (update: TownSettingsUpdate) => void;
  townClosing: () => void;
  chatMessage: (message: ChatMessage) => void;
  interactableUpdate: (interactable: Interactable) => void;
  gameUpdated: (game: GameSession) => void;
}

export interface ClientToServerEvents {
  chatMessage: (message: ChatMessage) => void;
  playerMovement: (movementData: PlayerLocation) => void;
  petMovement: (movementData: PlayerLocation) => void;
  interactableUpdate: (update: Interactable) => void;
  updateGame: (key: string) => void;
}

export interface PlayerScoreTuple{
  player: Player;
  score: number; 
}