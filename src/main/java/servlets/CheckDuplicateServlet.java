package servlets;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import database.DB_Connection;
import database.tables.CheckForDuplicatesExample;
import database.tables.EditUsersTable;
import javax.servlet.*;
import javax.servlet.http.*;

public class CheckDuplicateServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String field = request.getParameter("field"); /* get the field from http request */
        String value = request.getParameter("value"); /* get the value of the field from http req */
        String userType = request.getParameter("userType"); /* must know which matrix should check */

        boolean exists = false;

        try {

            if ("volunteer".equalsIgnoreCase(userType)) {
                /* volunteers checking */
                exists = checkFieldExists(field, value,"volunteers");
            }else{
                /* by default the userType is user*/
                exists = checkFieldExists(field, value,"users");
            }
            //exists = checkFieldExists(field, value);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"duplicate\": false, \"error\": \"Server error\"}");
            return;
        }

        /* returns the response of server back to ajax */
        response.getWriter().write("{\"duplicate\": " + exists + "}");
    }

    private boolean checkFieldExists(String field, String value, String table) throws Exception {
        Connection con = DB_Connection.getConnection();
        Statement stmt = con.createStatement();
        String query = "SELECT COUNT(*) FROM "+ table +" WHERE " + field + " = '" + value + "'";
        ResultSet rs = stmt.executeQuery(query);

        rs.next();
        int count = rs.getInt(1);

        rs.close();
        stmt.close();
        con.close();

        return count > 0;
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

    }
}