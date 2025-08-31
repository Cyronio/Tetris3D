class Tetracube {
    constructor(type) {
        this.type = type;
        this.shapes = [];
        for (let i = 0; i < 4; i++) {
            this.shapes.push(createShape());
        }

        //translating and scaling the cubes to be 1x1x1 and aligned to origin
        this.shapes.forEach(shape => {
            shape.translate([0.5,0.5,0.5]);
        });
        
        this.shapes.forEach(shape => {
            shape.scale([2.5,2.5,2.5]);
        });
        
        //creating the different types by translating the cubes
        if (type == 'I') {
            this.shapes[1].translate([0,1,0], true)
            this.shapes[2].translate([0,2,0], true)
            this.shapes[3].translate([0,3,0], true)
        }

        if (type == 'O') {
            this.shapes[1].translate([0,1,0], true)
            this.shapes[2].translate([1,1,0], true)
            this.shapes[3].translate([1,0,0], true)
        }

        if (type == 'L') {
            this.shapes[1].translate([0,1,0], true)
            this.shapes[2].translate([0,2,0], true)
            this.shapes[3].translate([1,0,0], true)
        }

        if (type == 'T') {
            this.shapes[1].translate([1,0,0], true)
            this.shapes[2].translate([1,1,0], true)
            this.shapes[3].translate([2,0,0], true)
        }

        if (type == 'N') {
            this.shapes[1].translate([1,0,0], true)
            this.shapes[2].translate([1,1,0], true)
            this.shapes[3].translate([2,1,0], true)
        }

        if (type == 'right') {
            this.shapes[1].translate([0,0,1], true)
            this.shapes[2].translate([1,0,1], true)
            this.shapes[3].translate([1,1,1], true)
        }

        if (type == 'left') {
            this.shapes[1].translate([0,1,0], true)
            this.shapes[2].translate([0,0,1], true)
            this.shapes[3].translate([1,0,1], true)
        }

        if (type == 'tripod') {
            this.shapes[1].translate([1,0,0], true)
            this.shapes[2].translate([1,1,0], true)
            this.shapes[3].translate([1,0,1], true)
        }

        //keeping track of complex object's movement
        this.transHist = [0,0,0];

        

        
    }

    translate(vector) {
        this.shapes.forEach(shape => {
            shape.translate(vector, true);
        })
        this.transHist[0] = this.transHist[0] + vector[0];
        this.transHist[1] = this.transHist[1] + vector[1];
        this.transHist[2] = this.transHist[2] + vector[2];
    }

    rotate(axis) {
        //translating to origin and then an addtional -1 on all parameters to get rotation around inner position
        let bufTransHist = [0,0,0];
        bufTransHist[0] = this.transHist[0];
        bufTransHist[1] = this.transHist[1];
        bufTransHist[2] = this.transHist[2];
        console.log(bufTransHist)
        this.translate([-bufTransHist[0], -bufTransHist[1], -bufTransHist[2]]);
        this.translate([-1,-1,-1]);
        this.shapes.forEach(shape => {
            
            shape.rotate(toRad(90), axis, true);
        });
        //translating back
        this.translate([1,1,1])
        this.translate(bufTransHist);
        this.transHist = bufTransHist;

    }

    draw() {
        this.shapes.forEach(shape => {
            shape.draw();
        });
    }
}