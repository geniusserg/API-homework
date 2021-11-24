import { ObjectId } from "mongodb";
import Game from "./game";
export default class User {
    constructor(public username: string, 
        public games: {game: string, playTime: number}[], public id?: ObjectId) {}
}
