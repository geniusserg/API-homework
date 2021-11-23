import { ObjectId } from "mongodb";
import Game from "./game";
export default class User {
    constructor(public name: string, 
        public hours: number,
        public games: {game: string, playTime: number}[], public id?: ObjectId) {}
}
