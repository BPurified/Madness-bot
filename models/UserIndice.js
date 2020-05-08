module.exports = (sequelize, DataTypes) => {
	return sequelize.define('user_indices', {
		userId: DataTypes.STRING,
		indices: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},
		serverId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};