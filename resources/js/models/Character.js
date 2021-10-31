import Storable from './Storable'
import GameData from "../services/GameData";

class Character {

    static make(uuid, game, id) {
        return new Character({uuid, game, id});
    }

    constructor(data = {}) {
        this.uuid = data.uuid;
        this.id = data.id;
        this.name = data.name;
        this.characterName = data.characterName;
        this.perkDescriptions = [];
        this.level = data.level || 1;
        this.xp = data.xp || 0;
        this.gold = data.gold || 0;
        this.items = {...data.items};
        this.notes = data.notes || '';
        this.checks = {...data.checks};
        this.perks = {...data.perks};
        this.isHidden = false;
        this.game = data.game;
        this.gameData = new GameData;

        this.fieldsToStore = {
            uuid: 'uuid',
            id: 'id',
            name: 'name',
            level: 'level',
            xp: 'xp',
            gold: 'gold',
            items: {'items': {}},
            notes: 'notes',
            checks: {'checks': {}},
            perks: {'perks': {}}
        };

        this.read();

        if (this.id && this.game && !this.name) {
            this.new();
        }
    }

    new() {
        this.name = this.characterName;
    }

    readGameData() {
        const data = this.gameData.characters(this.game)[this.id];
        this.characterName = data.name;
        this.perkDescriptions = data.perks;
        this.isHidden = data.isHidden || false;
    }

    fillBlanks() {
        for (let i = 0; i <= 17; i++) {
            this.checks[i] = this.checks[i] || false;
        }

        this.perkDescriptions.forEach((perk, index) => {
            for (let i = 0; i < perk.count; i++) {
                this.perks[index] = this.perks[index] || [];
                this.perks[index][i] = this.perks[index][i] || false;
            }
        })
    }

    read() {
        this.parentRead();
        this.readGameData();
        this.fillBlanks();
    }

    valuesToStore() {
        let values = this.parentValuesToStore();
        values.checks = collect({...this.checks}).filter(v => v).all();
        values.perks = collect({...this.perks}).filter(perks => (perks || []).filter(v => v)).all();
        values.items = collect({...this.items}).filter(v => v).all();
        return values;
    }

    key() {
        return 'character-' + this.uuid;
    }
}

Object.assign(Character.prototype, {
    parentRead: Storable.read,
    parentValuesToStore: Storable.valuesToStore,
    store: Storable.store,
    delete: Storable.delete,
});

export default Character;
