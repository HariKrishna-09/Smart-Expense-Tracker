const Transaction = require('../models/Transaction');

// Get Transactions
const getTransactions = async (req, res) => {
  try {

    const transactions = await Transaction.find({
      user: req.user._id
    });

    res.json(transactions);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: 'Failed to fetch transactions'
    });
  }
};

// Add Transaction
const addTransaction = async (req, res) => {
  try {

    console.log(req.body);

    const {
      type,
      amount,
      category,
      date,
      notes
    } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type,
      amount,
      category,
      date,
      notes
    });

    res.status(201).json(transaction);

  } catch (error) {

    console.log("ADD TRANSACTION ERROR:", error);

    res.status(500).json({
      message: 'Failed to add transaction'
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {

    const transaction = await Transaction.findById(
      req.params.id
    );

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    // Check owner
    if (
      transaction.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(401).json({
        message: 'Not authorized'
      });
    }

    await transaction.deleteOne();

    res.json({
      message: 'Transaction deleted'
    });

  } catch (error) {

    console.log("DELETE ERROR:", error);

    res.status(500).json({
      message: 'Failed to delete transaction'
    });
  }
};

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction
};