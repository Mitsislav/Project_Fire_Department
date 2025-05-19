/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package database.tables;

import com.google.gson.Gson;
import database.DB_Connection;

import java.sql.*;

import mainClasses.User;

/**
 *
 * @author micha
 */
public class CheckForDuplicatesExample {
    
    public boolean isUserNameAvailable(String username) throws SQLException, ClassNotFoundException{
         Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();

        ResultSet rs;
        try {
            rs = stmt.executeQuery("SELECT COUNT(username) AS total FROM users WHERE username = '" + username + "'");
            rs.next(); 
            if(rs.getInt("total")==0){
                 rs = stmt.executeQuery("SELECT COUNT(username) AS total2 FROM volunteers WHERE username = '" + username + "'");
                 rs.next();
                 if(rs.getInt("total2")==0){
                     return true;
                 }
             }
             return false;
          
        } catch (Exception e) {
            System.err.println("Got an exception! ");
            System.err.println(e.getMessage());
        }
    return false;
    }

    /* my code */

    public boolean isUserNamAvailable(String username) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        PreparedStatement pst = null;
        ResultSet rs = null;

        try {
            /* checking for users */
            String query = "SELECT COUNT(username) AS total FROM users WHERE username = ?";
            pst = con.prepareStatement(query);
            pst.setString(1, username);
            rs = pst.executeQuery();
            if (rs.next() && rs.getInt("total") > 0) {
                return false; /* username exists */
            }

            /* checking for volunteers */
            query = "SELECT COUNT(username) AS total FROM volunteers WHERE username = ?";
            pst = con.prepareStatement(query);
            pst.setString(1, username);
            rs = pst.executeQuery();
            if (rs.next() && rs.getInt("total") > 0) {
                return false; /* username exists */
            }

            return true; /* username is available */
        } finally {
            if (rs != null) rs.close();
            if (pst != null) pst.close();
            if (con != null) con.close();
        }
    }

    public boolean isEmailAvailable(String email) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        PreparedStatement pst = null;
        ResultSet rs = null;

        try {
            /* checking for users */
            String query = "SELECT COUNT(email) AS total FROM users WHERE email = ?";
            pst = con.prepareStatement(query);
            pst.setString(1, email);
            rs = pst.executeQuery();
            if (rs.next() && rs.getInt("total") > 0) {
                return false; /* email exists */
            }

            /* checking for volunteers */
            query = "SELECT COUNT(email) AS total FROM volunteers WHERE email = ?";
            pst = con.prepareStatement(query);
            pst.setString(1, email);
            rs = pst.executeQuery();
            if (rs.next() && rs.getInt("total") > 0) {
                return false; /* email exists */
            }

            return true; /* email is available */
        } finally {
            if (rs != null) rs.close();
            if (pst != null) pst.close();
            if (con != null) con.close();
        }
    }

    public boolean isTelephoneAvailable(String telephone) throws SQLException, ClassNotFoundException {
        Connection con = DB_Connection.getConnection();
        PreparedStatement pst = null;
        ResultSet rs = null;

        try {
            /* checking for users */
            String query = "SELECT COUNT(telephone) AS total FROM users WHERE telephone = ?";
            pst = con.prepareStatement(query);
            pst.setString(1, telephone);
            rs = pst.executeQuery();
            if (rs.next() && rs.getInt("total") > 0) {
                return false; /* telephone exists */
            }

            /* checking for volunteers */
            query = "SELECT COUNT(telephone) AS total FROM volunteers WHERE telephone = ?";
            pst = con.prepareStatement(query);
            pst.setString(1, telephone);
            rs = pst.executeQuery();
            if (rs.next() && rs.getInt("total") > 0) {
                return false; /* telephone exists */
            }

            return true; /* telephone is available */
        } finally {
            if (rs != null) rs.close();
            if (pst != null) pst.close();
            if (con != null) con.close();
        }
    }

}
