using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;


namespace Answer__Assignment_1_
{
    public partial class Form1 : Form
    {
        public class pointActor
        {
            public int X, Y;
            public Color cl;
        }

        List<pointActor> pointActors = new List<pointActor>();
        
        Bitmap off;
        Timer tt = new Timer();
        DDA Line = new DDA();

        bool isTraveling = false;
        int ct = 0;

        public Form1()
        {
            this.WindowState = FormWindowState.Maximized;
            this.Paint += Form1_Paint;
            this.Load += Form1_Load;
            this.MouseDown += Form1_MouseDown;
            tt.Tick += Tt_Tick;
            tt.Start();
        }
        private void Form1_Load(object sender, EventArgs e)
        {
            off = new Bitmap(ClientSize.Width, ClientSize.Height);
            MessageBox.Show("Click two times to place your points then click another time to start");
            drawDubb(this.CreateGraphics());   
        }

        private void Tt_Tick(object sender, EventArgs e)
        {
            if (isTraveling)
            {
                isTraveling = Line.CalcNextPoint();
            }

            drawDubb(this.CreateGraphics());
        }

        private void Form1_MouseDown(object sender, MouseEventArgs e)
        {
            if (!isTraveling)
            {
                if (e.Button == MouseButtons.Left && ct < 2)
                {
                    pointActor pnn = new pointActor();
                    pnn.X = e.X;
                    pnn.Y = e.Y;
                    pnn.cl = Color.Red;

                    pointActors.Add(pnn);
                    ct++;
                }
                else if (ct == 2)
                {
                    Line.Xst = pointActors[0].X;
                    Line.Yst = pointActors[0].Y + 10;

                    Line.Xend = pointActors[1].X;
                    Line.Yend = pointActors[1].Y + 10;

                    Line.calc();
                    isTraveling = true;
                }
            }
            drawDubb(this.CreateGraphics());
        }

        private void Form1_Paint(object sender, PaintEventArgs e)
        {
            drawDubb(e.Graphics);
        }

        void drawDubb(Graphics g)
        {
            Graphics g2 = Graphics.FromImage(off);
            drawScene(g2);
            g.DrawImage(off, 0, 0);
        }

        void drawScene(Graphics g)
        {
            g.Clear(Color.Black);
            g.DrawLine(Pens.Red, Line.Xst, Line.Yst, Line.Xend, Line.Yend);
            if (isTraveling) g.FillEllipse(Brushes.Yellow, Line.cx, Line.cy, 20, 20);

            for (int i = 0; i < pointActors.Count; i++)
            {
                g.FillEllipse(Brushes.Red, pointActors[i].X, pointActors[i].Y, 20, 20);
            }
            
        }
    }
}
