import { SimulationService } from './game/simulation.service';
import { TickService } from './tick.service';
import { ConfigService } from './config.service';
import { KeyboardService } from './game/Keyboard.service';

export class Alias {
    public static keyboardService:KeyboardService;
    public static configService:ConfigService;
    public static tickService:TickService;
    public static simulation:SimulationService;
}
