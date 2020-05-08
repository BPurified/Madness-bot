module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_characters', {
		userId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		serverId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		characterId: {
			type: DataTypes.INTEGER
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		health: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		mental: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		currentHealth: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		damage: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		madness: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		damageHidden: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		madnessHidden: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		currentMental: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		wounded: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		mad: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		strength: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		agility: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		observation: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		knowledge: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		influence: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		willpower: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};