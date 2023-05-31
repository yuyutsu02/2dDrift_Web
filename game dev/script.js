const windowWidth=window.innerWidth;
const windowHeight=window.innerHeight;

if(windowHeight>windowWidth){
    alert('please put it on portrait mode');
}


//game code inside
window.addEventListener('load',()=>{ 
    

    const canvas=document.querySelector('.cvs');
    const ctx=canvas.getContext('2d');
    //canvas width height for game unrelated to pixels
    const cWidth=canvas.width=2400;
    const cHeight=canvas.height=1200;


    // pressing keys on touch
    window.addEventListener('touchstart',e=>{  
       

        let X=e.touches[0].clientX;
        if(X>=windowWidth*0.5){
            //up press
            inputs.keys.push('ArrowUp');
        }
        if(X>=windowWidth*0.25 && X<windowWidth*0.5){
            //right press
            inputs.keys.push('ArrowRight');
        }
        if(X>=0 && X<windowWidth*0.25){
            //left press
            inputs.keys.push('ArrowLeft');
        }
    });

    //releasing keys on touch end
    window.addEventListener('touchend',e=>{  
      

        let X=e.changedTouches[0].screenX;
        if(X>=windowWidth*0.5){
            //up release
            inputs.keys.splice(inputs.keys.indexOf('ArrowUp'),1);
        }
        if(X>=windowWidth*0.25 && X<windowWidth*0.5){
            //right release
            inputs.keys.splice(inputs.keys.indexOf('ArrowRight'),1);
        }
        if(X>=0 && X<windowWidth*0.25){
            //left release
            inputs.keys.splice(inputs.keys.indexOf('ArrowLeft'),1);
        }
    });


    //key inputs
    class inputHandler{
        constructor(){
            this.keys=[];

            window.addEventListener('keydown',e=>{

                //inputting key pressed into array
                if(
                    e.key==='ArrowDown' && this.keys.indexOf(e.key)===-1||
                    e.key==='ArrowUp' && this.keys.indexOf(e.key)===-1||
                    e.key==='ArrowLeft' && this.keys.indexOf(e.key)===-1||
                    e.key==='ArrowRight' && this.keys.indexOf(e.key)===-1
                  ){
                    this.keys.push(e.key);
                }
                //show menu
                if(e.key==='m'||e.key==='M'){document.querySelector('.menu').style.display='flex';}
            });

            window.addEventListener('keyup',e=>{

                //clearing key from array because key was released
                if((e.key==='ArrowDown' || 
                    e.key==='ArrowUp'   || 
                    e.key==='ArrowLeft' || 
                    e.key==='ArrowRight'))
                {
                    this.keys.splice(this.keys.indexOf(e.key),1);
                }
            });
        //constructor end
        }
    //class end
    }
    //contains array(keys[]) of keys that are currently down
    const inputs=new inputHandler();



    //stores pair of numerical values and some methods
    class vector{
        constructor(x,y){this.x=x;this.y=y;}
        //vector addition//b=vector obj
        add(b) {this.x+=b.x,this.y+=b.y;}
        //vector sub//b=vector obj
        sub(b) {this.x+=(-b.x);this.y+=(-b.y);}
        //vector mag//a=vector obj
        mag(a) {return(Math.sqrt((a.x*a.x)+(a.y*a.y)));}
        //vector normalize//a=vector obj
        nor(a) {const aMag=mag(a);a.x/=aMag;a.y/=aMag;}
        //custom magnitude//a=vector obj//b=magnitude(number) 
        setMag(a,b) {const aMag=this.mag(a);a.x=(a.x/aMag)*b;a.y=(a.y/aMag)*b;}
        //scale//b=scaling factor(number)
        scale(b) {this.x*=b;this.y*=b;}

    //class end
    }

    //vector rotation//a==vector obj//b=+1to add 1 degree//-1 to subtract 1 degree
    function vectorRotate(a,b){
          // Step 1: Convert to polar coordinates
        let r = Math.sqrt(a.x * a.x + a.y * a.y);
        let theta = Math.atan2(a.y, a.x);
  
        // Step 2: Add 1 degree to the angle
        let newTheta = theta +(handle*b*(Math.PI / 180)); // Convert 1 degree to radians
  
        //  Step 3: Convert back to Cartesian coordinates
         a.x = r * Math.cos(newTheta);
         a.y = r * Math.sin(newTheta);
  
    }


    //velocity limit more=more velocity
    let revlimiter=10;
    //engine breaking or friction lessValue=more friction
    let engineBreaking=0.98;
    //bounceback after hitting a wall more=more reaction
    let bounceBack=0.1;
    //horsepower
    let power=0.15;
    let engine=new vector(power,0);
    //handeling
    var handle=1.5;
    //car
    let car=new Image();
    car.src='car.png';
    //background
    let bg=new Image();
    bg.src='track.jpg';

    //car or player
    const sqr={

        //initial position
        position:new vector(cWidth*0.5,cHeight*0.5),
        //dimension of square
        dimension:new vector(120,60),
        //velocity
        velocity:new vector(0,0),
        //angle
        radian:0.0174533,
        angle:0,

        //drawing on screen
        draw:function(){
            ctx.drawImage(bg,0,0,cWidth,cHeight);
            ctx.save();
            ctx.translate(this.position.x,this.position.y);
            ctx.rotate(this.angle*this.radian);
            // ctx.fillRect(0-this.dimension.x*0.5,0-this.dimension.y*0.5,this.dimension.x,this.dimension.y);
            ctx.drawImage(car,0-this.dimension.x*0.5,0-this.dimension.y*0.5,this.dimension.x,this.dimension.y);
            ctx.restore();
        },
        //updating position
        update:function(){

            this.position.add(this.velocity);
            // console.log(this.velocity.mag(this.velocity)*100);

            //friction
            if(this.velocity.mag(this.velocity)>0){
                this.velocity.scale(engineBreaking);
            }

            //velocity limit
            if(this.velocity.mag(this.velocity)>=revlimiter){this.velocity.setMag(this.velocity,revlimiter);}

            //accelerating on keypress and rotation
            inputs.keys.forEach((key)=>{
               
                if(key==='ArrowUp'){
                    this.velocity.add(engine);
                }
                if(key==='ArrowDown'){
                    this.velocity.sub(engine);
                }
                if(key==='ArrowLeft'){
                    if(this.velocity.mag(this.velocity)>0.8){
                    vectorRotate(engine,-1);
                    this.angle-=handle;
                    }
                }
                if(key==='ArrowRight'){
                    if(this.velocity.mag(this.velocity)>0.8){
                    vectorRotate(engine,1);
                    this.angle+=handle;
                    }
                }

            });
            


            //collision
            if(this.position.x<0){
                //left
                this.velocity.x=this.velocity.x*-1*bounceBack;
                //jittering fix
                this.position.x=0;
            }
            if(this.position.x>cWidth-this.dimension.x){
                //right
                this.velocity.x=this.velocity.x*-1*bounceBack;
                //jittering fix
                this.position.x=cWidth-this.dimension.x-0;
            }
            if(this.position.y<0){
                //up
                this.velocity.y=this.velocity.y*-1*bounceBack;
                //jittering fix
                this.position.y=0;
            }
            if(this.position.y>cHeight-this.dimension.y){
                //down
                this.velocity.y=this.velocity.y*-1*bounceBack;
                //jittering fix
                this.position.y=cHeight-this.dimension.y-0;
            }


        }
    };

   
    //input from the user
    const button=document.querySelector('.setValue');
        button.addEventListener('click',()=>{
            let ePower=document.querySelector('.enginePower');
            engine.x=(ePower.value)/100;
            let rLimiter=document.querySelector('.revLimiter');
            revlimiter=(rLimiter.value)/10;
            let eBreaking=document.querySelector('.engineBreaking');
            engineBreaking=(eBreaking.value)/1000;
            let cHandle=document.querySelector('.handle');
            handle=(cHandle.value)/10;
            let collisionForce=document.querySelector('.collisionForce');
            bounceBack=(collisionForce.value)/10;

  

            document.querySelector('.menu').style.display='none';
        });


    //
    function animate(){

        ctx.clearRect(0,0,cWidth,cHeight);
        sqr.draw();
        sqr.update();
        requestAnimationFrame(animate);

    }
    animate();

});
