import {tfhogwarts} from "./module/config.js";
import * as Chat from "./module/chat.js";
import { preloadHandlebarsTemplates } from "./module/templates.js";
import tfhogwartsActorSheet from "./module/actor/sheet.js";
import tfhogwartsActor from "./module/actor/entity.js";
//import tfhogwartsCombat from "./module/combat/combat.js";
//import tfhogwartsCombatTracker from "./module/combat/combatTracker.js";
import { registerSystemSettings } from "./module/settings.js";
import tfhogwartsItemSheet from "./module/item/sheet.js";
import tfhogwartsItem from "./module/item/entity.js";


Hooks.on("preCreateItem", (createData) => {
    if (!createData.img) {
        createData.img = "systems/tfhogwarts/img/riks_logo.jpg"
    }
});
Hooks.on("renderChatLog", (_app, html, _data) => Chat.addChatListeners(html));
Hooks.on("renderChatMessage", (app, html, data) => Chat.hideChatActionButtons(app, html, data));


// Klappe die Ergebnisse eines Rolls sofort im Chat auf!
Hooks.on("renderChatMessage", function (message){
    setTimeout(() => {
        $(`li.chat-message[data-message-id="${message.id}"] div.dice-tooltip`).css("display", "block")
    }, 250)
});


Hooks.once("init", function() {
    console.log("tfhogwarts | Initializing Tales From Hogwarts");

    game.tfhogwarts = {
        applications: {
            tfhogwartsActor,
            tfhogwartsActorSheet,
            tfhogwartsItem,
            tfhogwartsItemSheet
        },
        config: tfhogwarts,
        entities: {
            tfhogwartsActor,
            tfhogwartsItem
        }
    }

    CONFIG.tfhogwarts = tfhogwarts;
    CONFIG.Actor.documentClass = tfhogwartsActor;
    CONFIG.Item.documentClass = tfhogwartsItem;
    //CONFIG.Combat.documentClass = tfhogwartsCombat;
    //CONFIG.ui.combat = tfhogwartsCombatTracker;
    
    // Register System Settings
    registerSystemSettings();

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("tfhogwarts", tfhogwartsActorSheet, { makeDefault: true });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("tfhogwarts", tfhogwartsItemSheet, { smakeDefault: true });

    preloadHandlebarsTemplates();

    Handlebars.registerHelper("times", function(n, content) {
        let result = "";
        for (let i = 0; i < n; ++i){
            content.data.index = i + 1;
            result = result + content.fn(i);
        }
        
        return result;
    });

})
