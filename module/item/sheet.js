export default class tfhogwartsItemSheet extends ItemSheet {
    constructor(...args) {
        super(...args);
    }


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width : 650, 
            height: 450,
            classes: ["tfhogwarts", "sheet", "item"],
            resizable: true, 
        });
    }


    get template() {
        return `systems/tfhogwarts/templates/items/${this.item.type}.hbs`;
    }


    getData() {
        const data = super.getData();
        data.config = CONFIG.tfhogwarts;
        
        return data;
    }
}
