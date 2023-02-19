export const hideChatActionButtons = function (_message, html, _data) {
    const card = html.find(".tfhogwarts.chat-card");

    if (card.length > 0){
        let actor = game.actors.get(card.attr("data-actor-id"));

        if ((actor && !actor.isOwner)){
            const buttons = card.find(".reroll");
            buttons.each((_i, btn) => {
                btn.style.display = "none"
            });
        }
    }
}


export function addChatListeners(html) {
    html.on('click', 'button.reroll', onReroll);    
}


async function onReroll(event) {
    const card = event.currentTarget;
    let actor = game.actors.get(card.dataset.ownerId);
    
    let dicePool = card.dataset.dicepool;
    let rollFormula = dicePool + "d6cs6"

    let rolled = card.dataset.tested;

    let r = new Roll(rollFormula, actor.system.data);
    await r.evaluate();
    
    let rollValue = r.total;
    let rollTooltip = await Promise.resolve(r.getTooltip());
    
    let sucessText = game.i18n.localize("tfhogwarts.failure");
    
    if (rollValue > 0) {
        sucessText = rollValue + " " + game.i18n.localize(
            rollValue > 1 ? "tfhogwarts.successes" : "tfhogwarts.success"
        );
    }

    let reRollDiceFormula = Number(dicePool - r.total);

    // TODO: pull this out to a template.
    let chatHTML = `
        <span class="flavor-text">
            <div class="chat-header flexrow">
                <img class="portrait" width="48" height="48" src="` + actor.img + `"/>
                <h1>` + game.i18n.localize("tfhogwarts.rerolled") + `: ` + rolled + `</h1>
            </div>
            
            <div class="dice-roll">
                <div class="dice-result">
                    <div class="dice-formula">
                        ` + r._formula + `
                    </div>
                    ` + rollTooltip + `
                    <h4 class="dice-total">` + sucessText + `</h4>
                </div>
            </div>
            <div class="reroll-info" data-owner-id="` + actor.id + `">
                <button class="reroll" data-owner-id="` + actor.id + `" data-tested="` + rolled + `" data-dicepool="` + reRollDiceFormula + `" type="button">
                    ` + game.i18n.localize("tfhogwarts.push") + `
                </button>
            </div>
            <div>
            <div class="chat-decoration"><img src="systems/tfhogwarts/img/tfhogwarts/decoration-bottom.png" width="200" height="47"/></div>
            </div>
        </span>
    `

    if (game.dice3d){
        game.dice3d.showForRoll(r, game.user, true, null, false);
    }

    let chatOptions = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: actor, token: actor.img }),
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        roll: r,
        rollMode: game.settings.get("core", "rollMode"),
        content: chatHTML
    }
    
    ChatMessage.create(chatOptions);
}
