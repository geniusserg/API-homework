import { ObjectId } from "mongodb";
import Game from "./game";
export default class User {
    constructor(public name: string, public hours: number, public games: {game: Game, playTime: number}[], public id?: ObjectId) {}
}
