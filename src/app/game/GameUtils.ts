import { AISnake } from './AISnake';
import { Game } from './Game';
export class GameUtils {


    public static sortSnakes (snakes:AISnake[]):AISnake[]{
        const copy:AISnake[] = snakes.concat ();
        copy.sort (GameUtils.compareSnakes);
        return copy;
    }

    public static sortGames (games:Game[]):Game[]{
        const copy:Game[] = games.concat ();
        copy.sort ((a:Game, b:Game) => {
            return GameUtils.compareSnakes(a.snake, b.snake);    
        });
        return copy;
    }

    private static compareSnakes (a:AISnake, b:AISnake):number {
        if(a.bodyParts.length > b.bodyParts.length){
            return -1;
        }else if(a.bodyParts.length == b.bodyParts.length){
            
            if(!a.killedBecauseOfCircularMotion && (a.ticks > b.ticks)){
                return -1;
            }else{
                return 1;
            }                    

        }else{
            return 1
        }
    }


}
