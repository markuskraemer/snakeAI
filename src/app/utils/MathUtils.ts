export class MathUtils {

    public static clampNegPos (n:number):number{
        if(n < -1)
            return -1;

        if(n > 1)
            return 1;

        return n;
    }

    public static clamp01 (n:number):number{
        if(n < 0)
            return 0;
        
        if(n > 1)
            return 1;

        return n;
    }

    public static sigmoid (n:number):number {
        return 1 / (1 + Math.pow(Math.E, -n));
    }

    public static round3 (f:number):number {
        f *= 1000;
        f |= 0;
        return f / 1000;
    }

    public static distance (x1:number, y1:number, x2:number, y2:number):number {
        return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));  
    }

    public static pointIsOnLine (x1:number, y1:number, x2:number, y2:number, px:number, py:number, tolerance:number = .1) {

        // get distance from the point to the two ends of the line
        const d1:number = MathUtils.distance(px,py, x1,y1);
        const d2:number = MathUtils.distance(px,py, x2,y2);

        const lineLen:number = MathUtils.distance(x1,y1, x2,y2);

        // if the two distances are equal to the line's 
        // length, the point is on the line!
        // note we use the buffer here to give a range, 
        // rather than one #
        if (d1+d2 >= lineLen-tolerance && d1+d2 <= lineLen+tolerance) {
            return true;
        }
        return false;
    }


    public static rotateXY(pX:number, pY:number, radians:number, oX:number, oY:number):{x:number, y:number} {
        const cos:number = Math.cos(radians);
        const sin:number = Math.sin(radians);
        const dX:number = pX - oX
        const dY:number = pY - oY;

        return {
            x: cos * dX - sin * dY + oX,
            y: sin * dX + cos * dY + oY
        };
    }

}


