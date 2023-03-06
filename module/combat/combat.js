export default class tfhogwartsCombat extends Combat {
    _sortCombatants(a, b) {
        const initA = Number. isNumeric(a.initiative) ? a.initiative : -9999;
        const initB = Number. isNumeric(b.initiative) ? b.initiative : -9999;

        let initDifference = initB - initA;
        if (initDifference != 0) {
            return initDifference;
        }

        const typeA = a.actor.data.type;
        const typeB = b.actor.data.type;

        if (typeA != typeB) {
            if (typeA == "hero") {
                return -1;
        }
        if (typeB == "hero") {
            return -1;
        }
    }

        return a.tokenId - b.tokenId;
    }

    _prepareCombatant (c, scene, players, settings = {}) {
        let combatant = super. _prepareCombatant (c, scene, players, settings);
        combatant.flags.shotCost = Number.isNumeric (combatant. flags.shotCost) ? Number (combatant.flags.shotCost) : tfhogwarts.combat.defaultShotCost;
        return combatant;
  
    }


    async rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt) {
    await super.rollInitiative(ids, formulaopt, updateTurnopt, messageOptionsopt);
    return this.update({ turn: 0});
    }

    async startCombat() {
        await this.setupTurns();
        await this.setFlag("tfhogwarts", "turnHistory", []);
        return super.startCombat();
    }

}