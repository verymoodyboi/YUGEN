using System;

namespace Answer__Assignment_1_
{
    public class DDA
    {
        public float Xst, Yst;
        public float Xend, Yend;
        float dy, dx, m;
        public float cx, cy;
        int speed = 10;
        public void calc()
        {
            dy = Yend - this.Yst;
            dx = Xend - Xst;
            m = dy / dx;
            cx = Xst;
            cy = Yst;
        }

        public bool CalcNextPoint()
        {
            if (Math.Abs(dx) > Math.Abs(dy))
            {
                if (Xst < Xend)
                {
                    cx += speed;
                    cy += m * speed;
                    if (cx >= Xend)
                    {
                        return false;
                    }

                }
                else
                {
                    cx -= speed;
                    cy -= m * speed;
                    if (cx <= Xend)
                    {
                        return false;
                    }
                }
            }
            else
            {
                if (Yst < Yend)
                {
                    cy += speed;
                    cx += 1 / m * speed;
                    if (cy >= Yend)
                    {
                        return false;
                    }
                }
                else
                {
                    cy -= speed;
                    cx -= 1 / m * speed;
                    if (cy <= Yend)
                    {
                        return false;
                    }
                }

            }
            return true;
        }

    }
}