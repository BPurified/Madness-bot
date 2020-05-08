module.exports = (sequelize, DataTypes) => {
	return sequelize.define('madnesses', {
		madness_id: {
			type: DataTypes.STRING,
			unique: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		effect: {
			type: DataTypes.TEXT,
			allowNull: false
		},
		min_players: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
	}, {
		timestamps: false,
	});
};