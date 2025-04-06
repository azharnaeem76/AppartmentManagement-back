module.exports = (sequelize, Sequelize, schema) => {
    const Expense = sequelize.define(
        "expense",
        {
            title: {
                type: Sequelize.STRING,
            },
            invoice_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            due_date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            amount: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            after_due_date_amount: {
                type: Sequelize.FLOAT,
                allowNull: false,
                comment: "Amount to be paid if due date is missed",
            },
            status: {
                type: Sequelize.ENUM("pending", "paid"),
                allowNull: false,
                defaultValue: "pending",
            },
            type: {
                type: Sequelize.ENUM("union", "finance"),
                allowNull: false,
                comment: "Defines whether the expense is related to the union or finance.",
            },
            block_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "blocks",
                    key: "id",
                },
                comment: "The ID of the block associated with this expense.",
            },
        },
        { schema }
    );

    Expense.associate = (models) => {
        // Associate with Block
        Expense.belongsTo(models.Block, {
            foreignKey: "block_id",
            as: "block",
            onDelete: "CASCADE",
        });
    };

    return Expense;
};
