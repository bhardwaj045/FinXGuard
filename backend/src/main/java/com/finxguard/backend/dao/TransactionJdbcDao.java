package com.finxguard.backend.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

import javax.sql.DataSource;

import org.springframework.stereotype.Repository;

@Repository
public class TransactionJdbcDao {

    private final DataSource dataSource;

    public TransactionJdbcDao(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public List<String> findTransactionIdsByUser(String userId) throws Exception {
        String sql = """
                SELECT transaction_id
                FROM transactions
                WHERE user_id = ?
                ORDER BY id DESC
                """;

        List<String> transactionIds = new ArrayList<>();

        try (Connection connection = dataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {

            statement.setString(1, userId);

            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    transactionIds.add(resultSet.getString("transaction_id"));
                }
            }
        }

        return transactionIds;
    }
}
