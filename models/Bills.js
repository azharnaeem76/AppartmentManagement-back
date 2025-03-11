module.exports = (sequelize, Sequelize, schema) => {
    const Bill = sequelize.define(
        "bill",
        {
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            invoice_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            issued_on: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW, // Default to current date
            },
            due_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal("NOW() + INTERVAL '1 MONTH'"), // Adds 1 month
            },
            amount: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            payment_method: {
                type: Sequelize.ENUM("cash", "cheque", "bank transfer"),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM("pending", "paid"),
                allowNull: false,
                defaultValue: "pending",
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            residency_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "residencies",
                    key: "id",
                },
            },
        },
        { schema }
    );

    Bill.associate = (models) => {
        Bill.belongsTo(models.Residency, {
            foreignKey: "residency_id",
            as: "residency",
            onDelete: "CASCADE",
        });
    };

    return Bill;
};
