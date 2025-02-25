// Light/Dark Mode Toggle
const themeSwitch = document.getElementById('themeSwitch');
themeSwitch.addEventListener('change', () => {
    document.body.setAttribute('data-theme', themeSwitch.checked ? 'dark' : 'light');
});

// Existing code for motor configuration and code generation
let motorCount = 0;
let motorPorts = [];
let otherPortCount = 0;
let otherPorts = [];
let controlType = 'arcade';

function nextStep(step) {
    // Hide the previous step
    document.getElementById(`step${step - 1}`).style.display = 'none';

    // Show the current step
    document.getElementById(`step${step}`).style.display = 'block';

    if (step === 2) {
        motorCount = parseInt(document.getElementById('motorCount').value);
        let motorPortsHTML = '';
        for (let i = 0; i < motorCount; i++) {
            motorPortsHTML += `
                <div class="motor-config">
                    <label for="motorPort${i}">Motor ${i + 1} Port:</label>
                    <input type="number" id="motorPort${i}" min="1" max="21" required>
                    <label>
                        <input type="checkbox" id="motorReverse${i}"> Reverse
                    </label>
                </div>
            `;
        }
        document.getElementById('motorPorts').innerHTML = motorPortsHTML;
    } else if (step === 4) {
        motorPorts = [];
        for (let i = 0; i < motorCount; i++) {
            motorPorts.push({
                port: parseInt(document.getElementById(`motorPort${i}`).value),
                reverse: document.getElementById(`motorReverse${i}`).checked
            });
        }
        otherPortCount = parseInt(document.getElementById('otherPortCount').value);
        let otherPortsHTML = '';
        for (let i = 0; i < otherPortCount; i++) {
            otherPortsHTML += `
                <div class="other-config">
                    <label for="otherPort${i}">Other Port ${i + 1}:</label>
                    <input type="number" id="otherPort${i}" min="1" max="21" required>
                    <label>
                        <input type="checkbox" id="otherReverse${i}"> Reverse
                    </label>
                    <label for="otherButtonForward${i}">Forward Button:</label>
                    <input type="text" id="otherButtonForward${i}" placeholder="e.g., 'A', 'UP'" required>
                    <label for="otherButtonReverse${i}">Reverse Button:</label>
                    <input type="text" id="otherButtonReverse${i}" placeholder="e.g., 'B', 'DOWN'" required>
                </div>
            `;
        }
        document.getElementById('otherPorts').innerHTML = otherPortsHTML;
    } else if (step === 5) {
        otherPorts = [];
        for (let i = 0; i < otherPortCount; i++) {
            otherPorts.push({
                port: parseInt(document.getElementById(`otherPort${i}`).value),
                reverse: document.getElementById(`otherReverse${i}`).checked,
                buttonForward: document.getElementById(`otherButtonForward${i}`).value,
                buttonReverse: document.getElementById(`otherButtonReverse${i}`).value
            });
        }
        // Ensure step 5 is displayed
        document.getElementById(`step${step}`).style.display = 'block';
    }
}

function generateCode() {
    controlType = document.querySelector('input[name="controlType"]:checked').value;

    let code = `#include "main.h"\n\n`;
    code += `// Motor Initialization\n`;
    motorPorts.forEach((motor, index) => {
        const port = motor.reverse ? `-${motor.port}` : motor.port;
        code += `pros::Motor motor${index + 1}(${port});\n`;
    });
    otherPorts.forEach((port, index) => {
        const portNumber = port.reverse ? `-${port.port}` : port.port;
        code += `pros::Motor other${index + 1}(${portNumber});\n`;
    });
    code += `\n`;

    code += `void initialize() {\n`;
    code += `    pros::lcd::initialize();\n`;
    code += `    pros::lcd::set_text(1, "Hello PROS User!");\n`;
    code += `}\n\n`;

    code += `void disabled() {}\n\n`;
    code += `void competition_initialize() {}\n\n`;
    code += `void autonomous() {}\n\n`;

    code += `void opcontrol() {\n`;
    code += `    pros::Controller controller(pros::E_CONTROLLER_MASTER);\n\n`;
    code += `    while (true) {\n`;

    // Drivetrain Control Logic
    if (controlType === 'arcade') {
        code += `        int forward = controller.get_analog(pros::E_CONTROLLER_ANALOG_LEFT_Y);\n`;
        code += `        int turn = controller.get_analog(pros::E_CONTROLLER_ANALOG_RIGHT_X);\n`;
        code += `        motor1.move(forward + turn);\n`;
        code += `        motor2.move(forward + turn);\n`;
        if (motorCount > 2) {
            code += `        motor3.move(forward - turn);\n`;
            code += `        motor4.move(forward - turn);\n`;
        }
        if (motorCount > 4) {
            code += `        motor5.move(forward + turn);\n`;
            code += `        motor6.move(forward + turn);\n`;
        }
    } else {
        code += `        int left = controller.get_analog(pros::E_CONTROLLER_ANALOG_LEFT_Y);\n`;
        code += `        int right = controller.get_analog(pros::E_CONTROLLER_ANALOG_RIGHT_Y);\n`;
        code += `        motor1.move(left);\n`;
        code += `        motor2.move(left);\n`;
        if (motorCount > 2) {
            code += `        motor3.move(right);\n`;
            code += `        motor4.move(right);\n`;
        }
        if (motorCount > 4) {
            code += `        motor5.move(left);\n`;
            code += `        motor6.move(left);\n`;
        }
    }

    // Other Motor Control Logic (inside the while loop)
    otherPorts.forEach((port, index) => {
        code += `        if (controller.get_digital(pros::E_CONTROLLER_DIGITAL_${port.buttonForward.toUpperCase()})) {\n`;
        code += `            other${index + 1}.move(127);\n`;
        code += `        } else if (controller.get_digital(pros::E_CONTROLLER_DIGITAL_${port.buttonReverse.toUpperCase()})) {\n`;
        code += `            other${index + 1}.move(-127);\n`;
        code += `        } else {\n`;
        code += `            other${index + 1}.move(0);\n`;
        code += `        }\n`;
    });

    code += `        pros::delay(20);\n`;
    code += `    }\n`;
    code += `//made using VexAid\n`;
    code += `}\n`;

    document.getElementById('codeOutput').textContent = code;
    document.getElementById('generatedCode').style.display = 'block';
}

function copyCode() {
    const code = document.getElementById('codeOutput').textContent;
    navigator.clipboard.writeText(code).then(() => {
        alert('Code copied to clipboard!');
    });
}
