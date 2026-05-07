
/** 


 **/


/** wrapping of texts, looking good **/
const TEXT_WIDTH = 40;

function wrapText(text, width = TEXT_WIDTH) {
    const words = text.split(" ");
    let lines = [];
    let line = "";

    for (let word of words) {
        if ((line + word).length > width) {
            lines.push(line.trim());
            line = word + " ";
        } else {
            line += word + " ";
        }
    }

    if (line.trim()) {
        lines.push(line.trim());
    }

    return lines.join("\n");
}


/** game rooms and data **/

const rooms = {
    start: {
        name: "Darkness...",
        description:
            "You wake up foggy and confused. As you try to rise your head you hit your head rather fast&furiously, only to realize you're inside something that resembles a coffin... Luckily, the top is easy to pry open now that your head did most of the (head)job",
        exits: { north: "darkroom" },
        items: [],
    },

    darkroom: {
        name: "A Dark Room",
        description:
            "Bleading from the head you enter a room surrounded in darkness, except for a faint light in the corner, and you can barely see a door leading to the north. The walls feels cold to the touch, like metal. Metal container strifes your head",
        exits: { north: "forest1" },
        items: [],
        npc: {
            name: "Ghost",
            description: "A pale little ghost flickers silently in the corner.",
            dialog: [
                "You are not meant to be here, lost one.",
                "The forest ahead is filled with pounding, snarly darkness.",
                "Quickly, take this light! It may save your life! There's also somethi...."
            ],
            dialogIndex: 0,
            givesItem: "lamp",
            vanishAfterDialog: true,
            isDark: true,
        }
    },

    forest1: {
        name: "Forest",
        description:
            "You're finally out of this shed-like building. Tall trees surround you and sways in the heavy wind. The wind hurls through the branches, crakling, and something unseen moves between the trees. You can feel it's eyes follows you",
        exits: { south: "darkroom", east: "forest_east", west: "forest_west", north: "forest_north" },
        items: [],
        isDark: true,
    },

    forest_east: {
        name: "Forest",
        description:
            "The wind whispers through the branches. A mysterious black hole appears to the north of you. In the grass to the left you see an old but shiny dagger, there's some holy inscription written on it. Your wonder if someone or something wanted you to have this... ",
        exits: { west: "forest1", north: "room" },
        items: ["dagger"],
    },

        forest_west: {
        name: "Forest",
        description:
            "Tall trees sways surround you. Suddenly a dark creature jump right in front of you!!!",
        exits: { east: "forest1", north: "forest_north2" },
        items: [],
        monster: {
            name: "Oreo",
            description: "A nasty beast with dripping fangs and hungry eyes. The stench is so foul that you almost vomit.",
            hp: 20,
            maxHp: 20,
            attack: 4
        }
    },

        forest_north: {
        name: "Forest",
        description:
            "...even more trees swaying in the wind. You can see some ancient ruins from a long lost civilization",
        exits: { south: "forest1" },
        items: [],
    },
        forest_north2: {
        name: "The End",
        description:
            "You've technically reached the end thanks for playing. eol",
        exits: { },
        items: [],
    },
    
    room: {
        name: "Dead End Room",
        description:
            "As soon as you enter into this black hole, the door behind you slams down, and you stumble down into many spikes...",
        exits: { },
        items: [],
    },

};

const weapons = {
    dagger: { damage: 6 },
    fist: { damage: 2 }
};

let gameState = {
    location: "start",
    inventory: [],
    hp: 20,
    maxHp: 20,
    lampLit: true
};


/** output / print **/

function print(text) {
    document.getElementById("output").textContent += text + "\n";
}

function makeBar(value, max, width) {
    const filled = Math.max(0, Math.round((value / max) * width));
    return "[" + "#".repeat(filled) + "-".repeat(width - filled) + "]";
}


/** ui rendering **/

function renderUI(room) {
    const out = document.getElementById("output");
    out.textContent = "";

    const dark = room.isDark && !hasLight();

    out.textContent +=
`========================================
        ${room.name.toUpperCase()}
========================================

${wrapText(room.description)}

[HP] ${makeBar(gameState.hp, gameState.maxHp, 20)}

`;

    out.textContent += room.items.length
        ? `[ITEMS] ${room.items.join(", ")}\n`
        : `[ITEMS] Nothing you see \n`;

    out.textContent += `[EXITS] ${Object.keys(room.exits).join(", ")}\n\n`;

    if (room.npc) {
        out.textContent += `[NPC] ${wrapText(room.npc.description)}\n\n`;
    }

    if (room.monster) {
        const m = room.monster;
        out.textContent +=
`[MONSTER] ${m.name}
${wrapText(m.description)}
HP ${makeBar(m.hp, m.maxHp, 20)}

`;
    }
}

function describeLocation() {
    renderUI(rooms[gameState.location]);
}


/** game core **/

function move(direction) {
    const room = rooms[gameState.location];
    const next = room.exits[direction];

    if (!next) {
        print("You can't go that way.");
        return;
    }

    if (room.monster) {
        print("The monster blocks your escape!");
        return;
    }

    gameState.location = next;
    playSound("footsteps");
    describeLocation();
}

function takeItem(item) {
    const room = rooms[gameState.location];
    const idx = room.items.indexOf(item);

    if (idx === -1) {
        print("There is no " + item + " here.");
        return;
    }

    room.items.splice(idx, 1);
    gameState.inventory.push(item);
    //** playSound("pickup");
    print("Taken.");
}

function renderInventory() {
    if (gameState.inventory.length === 0) {
        print("You are carrying nothing.");
        return;
    }

    print(
`\n+------- INVENTORY -------+
${gameState.inventory.map(i => "| " + i).join("\n")}
+-------------------------+`
    );
}

function getPlayerDamage() {
    return gameState.inventory.includes("dagger")
        ? weapons.dagger.damage
        : weapons.fist.damage;
}

function hasLight() {
    return gameState.inventory.includes("lamp") && gameState.lampLit;
}

/** mortal kombat **/

function attackMonster() {
    const room = rooms[gameState.location];
    const monster = room.monster;

    if (!monster) {
        print("There is nothing here to attack.");
        return;
    }

    const dmg = getPlayerDamage();
    monster.hp -= dmg;
    //** playSound("monsterHit");
    print(wrapText(`You attack the ${monster.name} for ${dmg} damage.`));

    if (monster.hp <= 0) {
        room.monster = null;
		describeLocation();
		print(wrapText(`The ${monster.name} collapses in the dirt and dies.`));
        return;
    }

    gameState.hp -= monster.attack;
	playSound("playerHit"); 
    print(wrapText(`The ${monster.name} hits you for ${monster.attack} damage.`));

    if (gameState.hp <= 0) {
        print("You have been slain.");
        document.getElementById("input").disabled = true;
        return;
    }

    describeLocation();
}


/** npc **/

function talkToNPC() {
    const room = rooms[gameState.location];
    const npc = room.npc;

    if (!npc) {
        print("There is no one here to talk to.");
        return;
    }

// playSound("ghost");
    const line = npc.dialog[npc.dialogIndex];
    print(`${npc.name}: "${wrapText(line)}"`);

    npc.dialogIndex++;

    if (npc.dialogIndex === npc.dialog.length) {
        if (npc.givesItem) {
            print(wrapText(`The ${npc.name} gives you a ${npc.givesItem}.`));
            gameState.inventory.push(npc.givesItem);
        }

        if (npc.vanishAfterDialog) {
            print(wrapText("The ghost flickers, then fades into nothingness... Dazed, you can't help admire the moment you just witnessed."));
            room.npc = null;
        }
    }
}


/** input bar **/

function handleCommand(input) {
    const [cmd, ...rest] = input.toLowerCase().split(" ");
    const target = rest.join(" ");

    if (["north", "south", "east", "west"].includes(cmd)) {
        move(cmd);
        return;
    }

    switch (cmd) {
        //** case "look":
        //**    describeLocation();
        //**    break;
        case "go":
            move(target);
            break;
        case "take":
            takeItem(target);
            break;
        case "inventory":
        case "inv":
            renderInventory();
            break;
        case "talk":
            talkToNPC();
            break;
        case "attack":
            attackMonster();
            break;
        default:
            print("I don't understand that command.");
    }
}


/** sstart **/
const inputBox = document.getElementById("input");

inputBox.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        const command = inputBox.value.trim();
        inputBox.value = "";
        print("> " + command);
        handleCommand(command);
    }
});

//** print("Welcome to the mini-ASCII Adventure! Now with invntory");
describeLocation();
