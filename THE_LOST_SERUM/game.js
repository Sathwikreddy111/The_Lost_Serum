const readline = require('readline');
const { MongoClient } = require("mongodb");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const mongoClient = new MongoClient("mongodb://127.0.0.1:27017");
let db, sessions;

let currentRoom = "Quarantine Cell";
let inventory = [];
let enteredRooms = new Set();
let chronoStability = 100;
let gameMinutes = 0;
let playerName = "";
let saveSlot = 1;

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
      prompt: "Emergency code: Solve 15 × 4 + 2 − (6 ÷ 3)",
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

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function tickTime(flow) {
  const speedMap = { SLOW: 0.5, NORMAL: 1, FAST: 2 };
  const modifier = speedMap[flow] || 1;
  gameMinutes += Math.floor(5 * modifier);
  chronoStability -= Math.floor(Math.abs(modifier - 1) * 5);
  if (chronoStability <= 30) console.log("⚠️  Stability is dangerously low!");
  if (chronoStability <= 0) {
    console.log("💀 Your body succumbs. GAME OVER");
    process.exit();
  }
}

async function runPuzzle(roomName) {
  const puzzle = rooms[roomName].puzzle;
  if (!puzzle) return true;
  tickTime(rooms[roomName].timeFlow);

  if (puzzle.type === "riddle") {
    const attempt = await ask(`RIDDLE: ${puzzle.prompt}\n> `);
    return attempt.toLowerCase() === puzzle.answer.toLowerCase();
  }

  if (puzzle.type === "inventory") {
    return inventory.some(i => i.includes(puzzle.requiredItem));
  }

  if (puzzle.type === "combo") {
    const combo = await ask(puzzle.prompt + " ");
    return combo === puzzle.answer;
  }

  if (puzzle.type === "timed") {
    console.log(puzzle.prompt);
    const start = Date.now();
    const input = await ask("> ");
    return input.toUpperCase() === puzzle.answer && Date.now() - start <= puzzle.timeLimit;
  }

  if (puzzle.type === "final") {
    const required = [
      "Containment Gel",
      "Stabilized Enzyme",
      "Reactive Agent Z",
      "Gas Neutralizer",
      "Mechanical Injector",
      "Battery Regulator Chip"
    ];
    const hasAll = required.every(req => inventory.some(i => i.includes(req)));
    await sessions.insertOne({
      type: "result",
      player: playerName,
      slot: saveSlot,
      time: new Date(),
      result: hasAll ? "WIN" : "LOSS",
      inventory,
      minutes: gameMinutes,
      stability: chronoStability
    });
    if (hasAll) {
      console.log("\n✅ The vaccine stabilizes. You inject it and survive.");
      console.log("🏆 Congratulations, Dr. Voss! You saved yourself and perhaps humanity.");
      console.log("🧬 Your name will be remembered.");
    } else {
      console.log("\n💀 You failed to complete the vaccine.");
      console.log("☣️ The infection spreads uncontrollably.");
      console.log("📉 Humanity fades into darkness...");
    }
  
    process.exit();
  }

  return true;
}

function showRoom(name) {
  const room = rooms[name];
  console.clear();
  console.log(`\n=== ${name.toUpperCase()} ===`);
  console.log(room.description);
  console.log("Time Flow:", room.timeFlow);
  if (room.items.length) {
    console.log("\nItems available:");
    room.items.forEach((i, idx) => console.log(`  ${idx + 1}) ${i}`));
  }
  console.log("\nInventory:", inventory.length ? inventory.join(" | ") : "Empty");
  console.log("Stability:", chronoStability + "%", "| Game Time:", gameMinutes + " mins");
  console.log("\nExits:", Object.entries(room.exits).map(([k, v]) => `${k.toUpperCase()} → ${v}`).join(" | "));
  console.log("\nCONTROLS: W/A/S/D/U → Move | E → Pick Item | Type letter key then ENTER\n");
}

async function handleCommand(cmd) {
  const room = rooms[currentRoom];
  if (["w", "a", "s", "d", "u"].includes(cmd)) {
    const next = room.exits[cmd];
    if (!next) {
      console.log("❌ No path in that direction.");
    } else {
      const passed = await runPuzzle(next);
      if (passed) {
        currentRoom = next;
        enteredRooms.add(currentRoom);
        await sessions.insertOne({
          type: "action",
          player: playerName,
          slot: saveSlot,
          time: new Date(),
          action: `Moved to ${currentRoom}`,
          inventory,
          stability: chronoStability,
          minutes: gameMinutes
        });
      } else {
        console.log("❌ Puzzle failed. Try again later.");
        chronoStability -= 10;
      }
    }
  } else if (cmd === "e") {
    if (!room.items.length) return console.log("Nothing to pick up.");
    console.log("Pick an item:");
    room.items.forEach((i, idx) => console.log(`${idx + 1}) ${i}`));
    const pick = await ask("> ");
    const idx = parseInt(pick) - 1;
    if (idx >= 0 && idx < room.items.length) {
      const item = room.items.splice(idx, 1)[0];
      inventory.push(item);
      console.log("✅ Picked up:", item);
      await sessions.insertOne({
        type: "action",
        player: playerName,
        slot: saveSlot,
        time: new Date(),
        action: `Picked: ${item}`,
        room: currentRoom,
        inventory,
        stability: chronoStability
      });
    } else {
      console.log("Invalid item number.");
    }
  } else {
    console.log("Unknown command. Use W/A/S/D/U to move, E to pick items.");
  }
}

async function gameLoop() {
  console.clear();
  console.log("🧬 CHRONOS: THE LAST SERUM 🧬");
  playerName = await ask("Enter your name: ");
  saveSlot = parseInt(await ask("Choose save slot (1–3): "), 10);
  if (isNaN(saveSlot) || saveSlot < 1 || saveSlot > 3) saveSlot = 1;

  console.log(`Welcome, ${playerName}. Using Save Slot: ${saveSlot}`);
  await ask("Press ENTER to begin your mission...");

  while (true) {
    showRoom(currentRoom);
    const cmd = (await ask("> ")).toLowerCase();
    await handleCommand(cmd);
  }
}

async function initMongo() {
  await mongoClient.connect();
  db = mongoClient.db("The_Lost_Serum");
  sessions = db.collection("sessions");
  console.log("✅ Connected to MongoDB: The_Lost_Serum\n");
}

initMongo().then(gameLoop);

