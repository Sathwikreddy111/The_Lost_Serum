const rooms = {
    "Quarantine Cell": {
      description: "You wake up in an isolated dark room. Your head stabilizes.",
      items: ["Containment Gel - Used to stabilize chemicals", "Empty Syringe - Might be used later", "Old Flask - Useless cracked glass"],
      exits: { d: "Archive Chamber" },
      timeFlow: "NORMAL",
      puzzle: {
        type: "riddle",
        prompt: "I grow with knowledge but shrink with use. What am I?",
        answer: "mind"
      }
    },
    "Archive Chamber": {
      description: "Stacks of old logs and blinking terminals.",
      items: ["Stabilized Enzyme - Key vaccine compound", "Clipboard - Scribbled notes", "USB Drive - Corrupted data"],
      exits: { a: "Quarantine Cell", s: "Bio-Chem Lab" },
      timeFlow: "SLOW",
      puzzle: {
        type: "inventory",
        prompt: "Scanner requests containment gel.",
        requiredItem: "Containment Gel"
      }
    },
    "Bio-Chem Lab": {
    description: "Tubes hiss. One leaks badly.",
    items: ["Reactive Agent Z - Final synthesis catalyst", "Tube Clip - Mechanical clamp", "Glove - Torn and bloody"],
    exits: { w: "Ventilation Nexus", n: "Archive Chamber" },
    timeFlow: "FAST",
    puzzle: {
      type: "timed",
      prompt: "Quick! Type 'SEAL' in 6 seconds:",
      answer: "SEAL",
      timeLimit: 6000
      }
    },
  "Ventilation Nexus": {
    description: "Loud valves and control boards.",
    items: ["Gas Neutralizer - For toxic air", "Valve Wheel - Rusted", "Repair Clamp - Too weak"],
    exits: { s: "Robotics Bay", e: "Bio-Chem Lab" },
    timeFlow: "NORMAL",
    puzzle: {
      type: "combo",
      prompt: "Emergency code: Solve 15 * 4 + 2 - (6 ÷ 3)",
      answer: "60"
      }
    },
  "Robotics Bay": {
    description: "Broken bots and limbs everywhere.",
    items: ["Mechanical Injector - Required to deliver cure", "Circuit Board - Broken", "Servo Clamp - Missing part"],
    exits: { n: "Ventilation Nexus", d: "Power Core" },
    timeFlow: "SLOW",
    puzzle: {
      type: "inventory",
      prompt: "Coolant required.",
      requiredItem: "Gas Neutralizer"
      }
    },
  "Power Core": {
    description: "Blinding light and core surges.",
    items: ["Battery Regulator Chip - Final energy stabilizer", "Fused Wire - Shorted", "Power Cell - Dead"],
    exits: { u: "Robotics Bay", w: "Vaccine Assembly Lab" },
    timeFlow: "FAST",
    puzzle: {
      type: "timed",
      prompt: "Override system! Type 'OVERRIDE' in 5s:",
      answer: "OVERRIDE",
      timeLimit: 5000
      }
    },
  "Vaccine Assembly Lab": {
    description: "Final chamber for the cure...",
    items: [],
    exits: { e: "Power Core" },
    timeFlow: "NORMAL",
    puzzle: {
      type: "final"
      }
    } 
  };
  
  module.exports = {
    rooms
  };
