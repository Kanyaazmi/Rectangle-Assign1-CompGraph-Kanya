// Wait for the page to load
window.onload = function() {
    // Get the canvas element
    const canvas = document.getElementById('glCanvas');
    // Initialize the GL context
    const gl = canvas.getContext('webgl');

    // Only continue if WebGL is available and working
    if (!gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }

    // Set clear color to transparent (no color for the canvas)
    //gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // Set clear color to red, fully opaque
    gl.clearColor(1.0, 0.0, 0.0, 1.0); // parameters : (red,green,blue,alpha)
    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Vertex shader program
    const vsSource = `
        attribute vec4 aVertexPosition;
        void main() {
            gl_Position = aVertexPosition;
        }
    `;

    // Fragment shader program 
    const fsSource = `
         precision mediump float;
        uniform vec4 uFragColor;
        void main() {
            gl_FragColor = uFragColor;
        }
    `;

    // Initialize a shader program
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Get the attribute location
    const vertexPosition = gl.getAttribLocation(shaderProgram, 'aVertexPosition');

    // Create a buffer for the rectangle's positions.
    const positionBuffer = gl.createBuffer();

    // Select the positionBuffer as the one to apply buffer operations to from here out
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Create an array of positions for the rectangle.
    const positions = [
        -0.7,  0.5, // Top-left corner (-width/2, height/2)
         0.7,  0.5, // Top-right corner (width/2, height/2)
        -0.7, -0.5, // Bottom-left corner (-width/2, -height/2)
         0.7, -0.5, // Bottom-right corner (width/2, -height/2)
    ];

    // Pass the list of positions into WebGL to build the shape
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    // Tell WebGL how to pull out the positions from the position buffer into the vertexPosition attribute
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    // Use shader program
    gl.useProgram(shaderProgram);

    // Convert color names to RGBA values (To change colors)
    function getColorRGBA(colorName) {
        const colors = {
            "red": [1.0, 0.0, 0.0, 1.0],
            "green": [0.0, 1.0, 0.0, 1.0],
            "blue": [0.0, 0.0, 1.0, 1.0],
            "pink": [1.0, 0.75, 0.8, 1.0], // Define "pink" as RGBA
            "yellow": [1.0, 1.0, 0.0, 1.0],
        };
        return colors[colorName] || [1.0, 1.0, 1.0, 1.0]; // Default to white if not found
    }

    // Use the getColorRGBA function to get the RGBA values for a color like "pink"
    const color = getColorRGBA("pink");

    // Find the location of the uFragColor uniform
    const fragColorLocation = gl.getUniformLocation(shaderProgram, 'uFragColor');

    // Set the color for the fragment shader
    gl.uniform4fv(fragColorLocation, color);

    // Draw the rectangle
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}


// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}

// Creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}