export default class tfhogwartsActorSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: "systems/tfhogwarts/templates/actors/character.hbs",
      classes: ["tfhogwarts", "sheet", "actor", "character", "kid"],
      width: 1400,
      height: 950,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
    });
  }

  get template() {
    return `systems/tfhogwarts/templates/actors/${this.actor.type}.hbs`;
  }

  getData() {
    const sheet = super.getData();
    sheet.config = CONFIG.tfhogwarts;
    const actor = this.actor;

    sheet.relationships = sheet.items.filter(function (item) {
      return item.type == "relationship";
    });

    sheet.bonusItems = sheet.items.filter(function (item) {
      return item.type == "item";
    });

    if (actor.type == "kid") {
      sheet.scars = sheet.items.filter(function (item) {
        return item.type == "scar";
      });
    }
    // set House Logo 
    switch (sheet.data.system.type) {
      case "notassigned":
        actor.update({ "system.houseLogoUrl" : "systems/tfhogwarts/img/tfhogwarts/hogwarts.webp"});
        break;
      case "gryffindor":
        actor.update({ "system.houseLogoUrl" : "systems/tfhogwarts/img/tfhogwarts/gryffindor.webp"});
        break;
      case "hufflepuff":
        actor.update({ "system.houseLogoUrl" : "systems/tfhogwarts/img/tfhogwarts/hufflepuff.webp"});
        break;
      case "slytherin":
        actor.update({ "system.houseLogoUrl" : "systems/tfhogwarts/img/tfhogwarts/slytherin.webp"});
        break;
      case "ravenclaw":
        actor.update({ "system.houseLogoUrl" : "systems/tfhogwarts/img/tfhogwarts/ravenclaw.webp"});
        break;
      default:
        actor.update({ "system.houseLogoUrl" : "systems/tfhogwarts/img/tfhogwarts/hogwarts.webp"});
        break;
    }
    
    // set the max luck to change the number of boxes we draw on the sheet data.system.luck.max
    if (actor.type == "kid") {
      const maxLuck = 15 - Number(sheet.data.system.age);
      const curLuck = maxLuck - sheet.data.system.luck.value;

      if (Number(sheet.data.system.age) > 15) {
        actor.update({ "system.luck.max": 0 });
        actor.update({ "system.curLuck": 0 });
      } else {
        actor.update({ "system.luck.max": maxLuck });
        actor.update({ "system.curLuck": curLuck });
      }      
      
    }
    
    sheet.francein80s = game.settings.get("tfhogwarts", "francein80s")
      ? true
      : false;
    sheet.polishedition = game.settings.get("tfhogwarts", "polishedition")
      ? true
      : false;

    return sheet;
  }

  activateListeners(html) {
    if (this.isEditable) {
      html.find(".reset-luck").click(this._resetLuck.bind(this));
      html.find(".use-luck").click(this._onUseLuck.bind(this));
      html.find(".toggle-boolean").click(this._onToggleClick.bind(this));
      html.find(".item-create").click(this._onItemCreate.bind(this));
      html.find(".inline-edit").change(this._onItemEdit.bind(this));
      html.find(".item-delete").click(this._onItemDelete.bind(this));
      html
        .find(".exp-boxes")
        .on("click contextmenu", this._onExpChange.bind(this));
      html.find(".item-open").click(this._onItemOpen.bind(this));
      html.find(".sheet-body").on("drop", this._onItemDrop.bind(this));
      html.find(".item").on("drag", this._onItemDrag.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".add-to-pool").click(this._onAddToPool.bind(this));
    }

    super.activateListeners(html);
  }

  _onItemDrag(event) {
    event.preventDefault();

    game.data.item = this.actor.getEmbeddedDocument(
      "Item",
      event.currentTarget.closest(".item").dataset.itemId
    );
  }

  _onItemDrop(event) {
    event.preventDefault();

    let actor = this.actor;
    let storedItem = game.data.item;

    if (storedItem && storedItem.actor != actor) {
      let itemData = [
        {
          name: storedItem.name,
          type: storedItem.type,
          system: {
            description: storedItem.system.description,
            notes: storedItem.system.notes,
          },
        },
      ];
      return actor.createEmbeddedDocuments("Item", itemData);
    }

    return;
  }

  async _onAddToPool(event) {
    event.preventDefault();

    let actor = this.actor;
    let data = actor.system;
    let items = actor.items.filter(function (item) {
      return item.type == "item";
    });

    let element = event.currentTarget;
    let rolled = element.dataset.rolled;
    let statRolled = "";
    let conditionPenalty = "";

    // if we are broken then we fail no matter what.
    if (!data.broken) {
      //see what we rolled on and set up initial dice pool
      switch (rolled) {
        case "body":
          console.log(data.body);
          data.dicePool += data.body;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.body") +
            " +" +
            data.body +
            "</div>";
          break;
        case "magic":
          data.dicePool += data.magic;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.magic") +
            " +" +
            data.magic +
            "</div>";
          break;
        case "heart":
          data.dicePool += data.heart;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.heart") +
            " +" +
            data.heart +
            "</div>";
          break;
        case "mind":
          data.dicePool += data.mind;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.mind") +
            " +" +
            data.mind +
            "</div>";
          break;
        case "flight":
        data.dicePool += data.body;
        data.dicePool += data.flight;
        statRolled =
          '<div class="pool-detail">' +
          game.i18n.localize("tfhogwarts.body") +
          " +" +
          data.body +
          "</div>";
        statRolled +=
          '<div class="pool-detail">' +
          game.i18n.localize("tfhogwarts.flight") +
          " +" +
          data.flight +
          "</div>";
        break;
        case "sneak":
          data.dicePool += data.body;
          data.dicePool += data.sneak;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.body") +
            " +" +
            data.body +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.sneak") +
            " +" +
            data.sneak +
            "</div>";
          break;
        case "force":
          data.dicePool += data.body;
          data.dicePool += data.force;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.body") +
            " +" +
            data.body +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.force") +
            " +" +
            data.force +
            "</div>";
          break;
        case "move":
          data.dicePool += data.body;
          data.dicePool += data.move;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.body") +
            " +" +
            data.body +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.move") +
            " +" +
            data.move +
            "</div>";
          break;
          case "ferula":
            data.dicePool += data.magic;
            data.dicePool += data.ferula;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.ferula") +
              " +" +
              data.ferula +
              "</div>";
            break;
          case "lumosnox":
            data.dicePool += data.magic;
            data.dicePool += data.lumosnox;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.lumosnox") +
              " +" +
              data.lumosnox +
              "</div>";
            break;
          case "alohomora":
            data.dicePool += data.magic;
            data.dicePool += data.alohomora;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.alohomora") +
              " +" +
              data.alohomora +
              "</div>";
            break;
          case "periculum":
            data.dicePool += data.magic;
            data.dicePool += data.periculum;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.periculum") +
              " +" +
              data.periculum +
              "</div>";
            break;
          case "petriflicustotalus":
            data.dicePool += data.magic;
            data.dicePool += data.petriflicustotalus;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.petriflicustotalus") +
              " +" +
              data.petriflicustotalus +
              "</div>";
            break;
          case "wingardiumleviosa":
            data.dicePool += data.magic;
            data.dicePool += data.wingardiumleviosa;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.wingardiumleviosa") +
              " +" +
              data.wingardiumleviosa +
              "</div>";
            break;
          case "expelliarmus":
            data.dicePool += data.magic;
            data.dicePool += data.expelliarmus;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.expelliarmus") +
              " +" +
              data.expelliarmus +
              "</div>";
            break;            
          case "incendio":
            data.dicePool += data.magic;
            data.dicePool += data.incendio;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.incendio") +
              " +" +
              data.incendio +
              "</div>";
            break;
          case "protego":
            data.dicePool += data.magic;
            data.dicePool += data.protego;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.protego") +
              " +" +
              data.protego +
              "</div>";
            break;
          case "reparo":
            data.dicePool += data.magic;
            data.dicePool += data.reparo;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.reparo") +
              " +" +
              data.reparo +
              "</div>";
            break;
          case "ridiculus":
            data.dicePool += data.magic;
            data.dicePool += data.ridiculus;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.ridiculus") +
              " +" +
              data.ridiculus +
              "</div>";
            break;
          case "herbivicus":
            data.dicePool += data.magic;
            data.dicePool += data.herbivicus;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.herbivicus") +
              " +" +
              data.herbivicus +
              "</div>";
            break;
          case "episkey":
            data.dicePool += data.magic;
            data.dicePool += data.episkey;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.episkey") +
              " +" +
              data.episkey +
              "</div>";
            break;
          case "depulso":
            data.dicePool += data.magic;
            data.dicePool += data.depulso;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.depulso") +
              " +" +
              data.depulso +
              "</div>";
            break;
          case "accio":
            data.dicePool += data.magic;
            data.dicePool += data.accio;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.accio") +
              " +" +
              data.accio +
              "</div>";
            break;
          case "stupor":
            data.dicePool += data.magic;
            data.dicePool += data.stupor;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.stupor") +
              " +" +
              data.stupor +
              "</div>";
            break;
          case "espectopatronum":
            data.dicePool += data.magic;
            data.dicePool += data.espectopatronum;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.espectopatronum") +
              " +" +
              data.espectopatronum +
              "</div>";
            break;
          case "glacius":
            data.dicePool += data.magic;
            data.dicePool += data.glacius;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.glacius") +
              " +" +
              data.glacius +
              "</div>";
            break;
          case "imperio":
            data.dicePool += data.magic;
            data.dicePool += data.imperio;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.imperio") +
              " +" +
              data.imperio +
              "</div>";
            break;
          case "flipendo":
            data.dicePool += data.magic;
            data.dicePool += data.flipendo;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.flipendo") +
              " +" +
              data.flipendo +
              "</div>";
            break;
          case "bombarda":
            data.dicePool += data.magic;
            data.dicePool += data.bombarda;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.bombarda") +
              " +" +
              data.bombarda +
              "</div>";
            break;
          case "crucio":
            data.dicePool += data.magic;
            data.dicePool += data.crucio;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.crucio") +
              " +" +
              data.crucio +
              "</div>";
            break;
          case "muffliato":
            data.dicePool += data.magic;
            data.dicePool += data.muffliato;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.muffliato") +
              " +" +
              data.muffliato +
              "</div>";
            break;
          case "redactum":
            data.dicePool += data.magic;
            data.dicePool += data.redactum;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.redactum") +
              " +" +
              data.redactum +
              "</div>";
            break;
          case "vulnerasanentur":
            data.dicePool += data.magic;
            data.dicePool += data.vulnerasanentur;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.vulnerasanentur") +
              " +" +
              data.vulnerasanentur +
              "</div>";
            break;
          case "confringo":
            data.dicePool += data.magic;
            data.dicePool += data.confringo;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.confringo") +
              " +" +
              data.confringo +
              "</div>";
            break;
          case "avadakedavra":
            data.dicePool += data.magic;
            data.dicePool += data.avadakedavra;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.magic") +
              " +" +
              data.magic +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.avadakedavra") +
              " +" +
              data.avadakedavra +
              "</div>";
            break;
          case "creatures":
            data.dicePool += data.heart;
            data.dicePool += data.creatures;
            statRolled =
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.heart") +
              " +" +
              data.heart +
              "</div>";
            statRolled +=
              '<div class="pool-detail">' +
              game.i18n.localize("tfhogwarts.creatures") +
              " +" +
              data.creatures +
              "</div>";
            break;
          case "contact":
          data.dicePool += data.heart;
          data.dicePool += data.contact;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.heart") +
            " +" +
            data.heart +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.contact") +
            " +" +
            data.contact +
            "</div>";
          break;
        case "charm":
          data.dicePool += data.heart;
          data.dicePool += data.charm;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.heart") +
            " +" +
            data.heart +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.charm") +
            " +" +
            data.charm +
            "</div>";
          break;
        case "lead":
          data.dicePool += data.heart;
          data.dicePool += data.lead;

          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.heart") +
            " +" +
            data.heart +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.lead") +
            " +" +
            data.lead +
            "</div>";
          break;
        case "herbology":
          data.dicePool += data.mind;
          data.dicePool += data.herbology;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.mind") +
            " +" +
            data.mind +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.herbology") +
            " +" +
            data.herbology +
            "</div>";
          break;
        case "potions":
          data.dicePool += data.mind;
          data.dicePool += data.potions;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.mind") +
            " +" +
            data.mind +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.potions") +
            " +" +
            data.potions +
            "</div>";
          break;
        case "investigate":
          data.dicePool += data.mind;
          data.dicePool += data.investigate;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.mind") +
            " +" +
            data.mind +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.investigate") +
            " +" +
            data.investigate +
            "</div>";
          break;
        case "comprehend":
          data.dicePool += data.mind;
          data.dicePool += data.comprehend;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.mind") +
            " +" +
            data.mind +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.comprehend") +
            " +" +
            data.comprehend +
            "</div>";
          break;
        case "empathize":
          data.dicePool += data.mind;
          data.dicePool += data.empathize;
          statRolled =
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.mind") +
            " +" +
            data.mind +
            "</div>";
          statRolled +=
            '<div class="pool-detail">' +
            game.i18n.localize("tfhogwarts.empathize") +
            " +" +
            data.empathize +
            "</div>";
          break;
      }

      //reduce dice by conditions
      if (data.upset) {
        if (data.dicePool > 0) {
          data.dicePool -= 1;
        }
        conditionPenalty +=
          '<div class="pool-detail penalty">' +
          game.i18n.localize("tfhogwarts.upset") +
          " -1</div>";
      }

      if (data.scared) {
        if (data.dicePool > 0) {
          data.dicePool -= 1;
        }
        conditionPenalty +=
          '<div class="pool-detail penalty">' +
          game.i18n.localize("tfhogwarts.scared") +
          " -1</div>";
      }

      if (data.exhausted) {
        if (data.dicePool > 0) {
          data.dicePool -= 1;
        }
        conditionPenalty +=
          '<div class="pool-detail penalty">' +
          game.i18n.localize("tfhogwarts.exhausted") +
          " -1</div>";
      }

      if (data.injured) {
        if (data.dicePool > 0) {
          data.dicePool -= 1;
        }
        conditionPenalty +=
          '<div class="pool-detail penalty">' +
          game.i18n.localize("tfhogwarts.injured") +
          " -1</div>";
      }

      // next set up the dialog to allow the player to select an item and add any bonus dice
      // build the html for the roll dialog
      let rollHTML = `
                <div class="form-group">
                    <h2>${game.i18n.localize(
                      "tfhogwarts.rolling"
                    )}: ${game.i18n.localize("tfhogwarts." + rolled)}</h2>
                    <div class="pool-count">${game.i18n.localize(
                      "tfhogwarts.currentPool"
                    )}: ${data.dicePool} ${game.i18n.localize("tfhogwarts.dice")}</div>
                    <div class="pool-details">
                        ${statRolled}
                    
                        ${conditionPenalty}
                    <div class="divider"></div>
                    <div class="pool-item-select">
                    <label for="roll-item">${game.i18n.localize(
                      "tfhogwarts.useItem"
                    )}:</label>
                    <select id="roll-item" name="useItem" style="margin-bottom: 5px">
                        <option value="0">${game.i18n.localize(
                          "tfhogwarts.none"
                        )}</option>
                        <option value="2">${game.i18n.localize(
                          "tfhogwarts.iconic"
                        )}${data.iconicItem.desc} + 2</option>
                        ${items.map(
                          (item) =>
                            '<option value="' +
                            item.system.bonus +
                            '">' +
                            item.name +
                            " + " +
                            item.system.bonus +
                            "</option>"
                        )}
                    </select>
                    </div>
                        <div class="bonus-dice flexrow" style="margin-bottom: 5px;">
                            <label>${game.i18n.localize(
                              "tfhogwarts.bonusDice"
                            )}: </label>
                            <input name="bonusDice" type="text" value="" placeholder="0" data-dtype="Number"/>
                        </div>
                    </div>
                    <div class="chat-decoration"><img src="systems/tfhogwarts/img/tfhogwarts/decoration-bottom.png" width="200" height="47"/></div>
                </div>
            `;

      let chatHTML = ``;

      // create dialog to get the use of item and or a bonus for dice
      let yesRoll = false;
      let d = new Dialog({
        title: game.i18n.localize("tfhogwarts.diceRoll"),
        content: rollHTML,
        buttons: {
          one: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("tfhogwarts.roll"),
            callback: () => {
              yesRoll = true;
            },
          },
          two: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("tfhogwarts.cancel"),
            callback: () => {
              data.dicePool = 0;
            },
          },
        },
        default: "two",
        render: (_html) =>
          console.log("tfhogwarts | Rendering Dice Rolling Dialog"),
        close: async (html) => {
          if (yesRoll) {
            let itemBonus = Number(html.find('[name="useItem"]')[0].value);
            let bonusDice = Number(html.find('[name="bonusDice"]')[0].value);
            data.dicePool += itemBonus;
            data.dicePool += bonusDice;
            if (data.dicePool <= 0) {
              data.dicePool = 1;
            }

            let rollFormula = data.dicePool + "d6cs6";

            console.log("tfhogwarts | Rolling Dice: " + this.actor);

            let r = new Roll(rollFormula, this.actor.system.data);
            await r.evaluate();

            let rollValue = r.total;
            console.log("DICE ROLL :" + rollValue);
            let rollTooltip = await Promise.resolve(r.getTooltip());
            let sucessText = game.i18n.localize("tfhogwarts.failure");
            if (rollValue > 0) {
              console.log("DICE ROLL success");
              sucessText =
                rollValue +
                " " +
                game.i18n.localize(
                  rollValue > 1 ? "tfhogwarts.successes" : "tfhogwarts.success"
                );
            }

            let reRollDiceFormula = Number(data.dicePool - r.total);

            //TODO pull this out to a template.
            chatHTML =
              `
                            <span class="flavor-text">
                                <div class="chat-header flexrow">
                                    <img class="portrait" width="48" height="48" src="` +
              this.actor.img +
              `"/>
                                    <h1>` +
              game.i18n.localize("tfhogwarts.tested") +
              `: ` +
              game.i18n.localize("tfhogwarts." + rolled) +
              `</h1>
                                </div>
                                <div class="tfhogwarts chat-card" data-actor-id="` +
              actor.id +
              `">
                                <div class="dice-roll">
                                    <div class="dice-result">
                                        <div class="dice-formula">
                                            ` +
              r._formula +
              `
                                        </div>
                                            ` +
              rollTooltip +
              `
                                        <h4 class="dice-total">` +
              sucessText +
              `</h4>
                                    </div>
                                </div>
                                <div class="reroll-info" data-owner-id="` +
              actor.id +
              `">
                                    <button class="reroll" data-owner-id="` +
              actor.id +
              `" data-tested="` +
              game.i18n.localize("tfhogwarts." + rolled) +
              `" data-dicepool="` +
              reRollDiceFormula +
              `" type="button">
                                        ` +
              game.i18n.localize("tfhogwarts.push") +
              `
                                    </button>
                                </div>
                                </div>
                                <div class="chat-decoration"><img src="systems/tfhogwarts/img/tfhogwarts/decoration-bottom.png" width="200" height="47"/></div>
                            </span>
                        `;

            data.dicePool = 0;

            if (game.dice3d) {
              game.dice3d.showForRoll(r, game.user, true, null, false);
            }

            let chatOptions = {
              user: game.user.id,
              speaker: ChatMessage.getSpeaker({
                actor: this.actor,
                token: this.actor.img,
              }),
              type: CONST.CHAT_MESSAGE_TYPES.OTHER,
              roll: r,
              rollMode: game.settings.get("core", "rollMode"),
              content: chatHTML,
            };

            ChatMessage.create(chatOptions);
          } else {
            data.dicePool = 0;
          }
        },
      });

      d.render(true);
    } else {
      ui.notifications.info(game.i18n.localize("tfhogwarts.brokeFail"));
    }
  }

  _onExpChange(event) {
    event.preventDefault();

    let actor = this.actor;
    let currentCount = actor.system.exp;

    let newCount =
      event.type == "click"
        ? Math.min(currentCount + 1, 10)
        : Math.max(currentCount - 1, 0);

    actor.update({ "data.exp": newCount });
  }

  _resetLuck(event) {
    event.preventDefault();

    this.actor.update({ "system.luck.value": 0 });
  }

  _onUseLuck(event) {
    event.preventDefault();

    let actor = this.actor;
    let maxLuck = actor.system.luck.max;
    let usedLuck = actor.system.luck.value;

    if (usedLuck < maxLuck) {
      usedLuck += 1;
    } else {
      usedLuck = usedLuck;
    }

    actor.update({ "system.luck.value": usedLuck });
  }

  _onItemOpen(event) {
    event.preventDefault();

    let item = this.actor.getEmbeddedDocument(
      "Item",
      event.currentTarget.closest(".item").dataset.itemId
    );
    item.sheet.render(true);
  }

  _onItemEdit(event) {
    event.preventDefault();
    console.log(event);
    let element = event.currentTarget;
    let item = this.actor.getEmbeddedDocument(
      "Item",
      element.closest(".item").dataset.itemId
    );

    console.log(item);
    let field = element.dataset.field;
      console.log(field);

    return item.update({ [field]: element.value });
  }

  _onItemDelete(event) {
    event.preventDefault();
    let deleteId = [event.currentTarget.closest(".info-item").dataset.itemId];

    return this.actor.deleteEmbeddedDocuments("Item", deleteId);
  }

  _onItemCreate(event) {
    event.preventDefault();

    let itemData = [
      {
        name: game.i18n.localize("tfhogwarts.new"),
        type: event.currentTarget.dataset.type,
      },
    ];

    return this.actor.createEmbeddedDocuments("Item", itemData);
  }

  _onToggleClick(event) {
    event.preventDefault();

    let element = event.currentTarget;
    let actor = this.actor;
    let item = "";

    if (element.closest(".item")) {
      item = this.actor.getEmbeddedDocument(
        "Item",
        element.closest(".item").dataset.itemId
      );
    }

    switch (element.dataset.toggle) {
      case "upset":
        if (this.actor.system.upset) {
          this.actor.system.upset = false;
          actor.update({ "system.upset": false });
        } else {
          this.actor.system.upset = true;
          actor.update({ "system.upset": true });
        }

        break;
      case "scared":
        if (this.actor.system.scared) {
          this.actor.system.scared = false;
          actor.update({ "system.scared": false });
        } else {
          this.actor.system.scared = true;
          actor.update({ "system.scared": true });
        }

        break;
      case "exhausted":
        if (this.actor.system.exhausted) {
          this.actor.system.exhausted = false;
          actor.update({ "system.exhausted": false });
        } else {
          this.actor.system.exhausted = true;
          actor.update({ "system.exhausted": true });
        }

        break;
      case "injured":
        if (this.actor.system.injured) {
          this.actor.system.injured = false;
          actor.update({ "system.injured": false });
        } else {
          this.actor.system.injured = true;
          actor.update({ "system.injured": true });
        }

        break;
      case "broken":
        if (this.actor.system.broken) {
          this.actor.system.broken = false;
          actor.update({ "system.broken": false });
        } else {
          this.actor.system.broken = true;
          actor.update({ "system.broken": true });
        }

        break;
      case "prideCheck":
        if (this.actor.system.prideCheck) {
          this.actor.system.prideCheck = false;
          actor.update({ "system.prideCheck": false });
        } else {
          this.actor.system.prideCheck = true;
          actor.update({ "system.prideCheck": true });
        }
        break;

      case "accepted":
        console.log(item);
        if (item.system.accepted) {
          item.system.accepted = false;
          item.update({ "system.accepted": false });
        } else {
          item.system.accepted = true;
          item.update({ "system.accepted": true });
        }

        break;
    }
  }
}
