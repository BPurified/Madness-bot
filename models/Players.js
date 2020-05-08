module.exports = (sequelize, DataTypes) => {
	return sequelize.define('players', {
		serverID: {
      type: DataTypes.INTEGER,
			unique: true
    },
		players: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
	}, {
		timestamps: false,
	});
};