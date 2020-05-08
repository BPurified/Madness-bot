module.exports = (sequelize, DataTypes) => {
	return sequelize.define('characters', {
		name: {
			type: DataTypes.STRING,
			unique: true,
		},
		title: {
			type: DataTypes.STRING,
			unique: true,
		},
		health: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		mental: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
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
		characterId: {
			type: DataTypes.INTEGER,
			unique: true,
		},
	}, {
		timestamps: false,
	});
};