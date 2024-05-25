const express = require('express');
const cors = require('cors');
app = express();
const mysql = require('mysql');

app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'forum',
});

connection.connect();

app.get('/post', (req, res) => {
  connection.query(
    `SELECT p.*, users.username, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as num_of_comments FROM posts p JOIN users ON p.author_id = users.id;`,
    (error, results, fields) => {
      if (error) throw error;
      res.status(200).send(results);
    }
  );
});

app.get('/groups', (req, res) => {
  connection.query(
    `SELECT * FROM \`groups\`;`,
    (error, results, fields) => {
      if (error) throw error;
      res.status(200).send(results);
    }
  )
})

app.get('/group/:id', (req, res) => {
  let responseBody = {
    id: null,
    group_name: null,
    posts: null,
  };
  connection.query(
    `
    SELECT *
    FROM \`groups\`
    WHERE id = ${req.params.id};
    `,
    (error, results, fields) => {
      if (error) throw error;
      if (results.length === 0) {
        res.status(404);
        return;
      }
      responseBody = results[0];
    }
  );
  connection.query(
    `
    SELECT p.*, u.username, (SELECT COUNT(*) FROM comments WHERE comments.post_id = p.id) as num_of_comments
    FROM posts p
    JOIN users u
    ON p.author_id = u.id
    WHERE group_id = ${req.params.id}
    ORDER BY p.created_at DESC;
    `,
    (error, results, fields) => {
      if (error) throw error;
      responseBody.posts = results;
      res.status(200).send(responseBody);
    }
  );
});

app.get('/post/:id', (req, res) => {
  connection.query(
    `SELECT posts.*, users.username FROM posts JOIN users ON posts.author_id = users.id WHERE posts.id = ${req.params.id};`,
    (error, results, fields) => {
      if (error) throw error;
      res.status(200).send(results);
    }
  )
});

app.get('/post/:id/comments', (req, res) => {
  connection.query(
    `SELECT comments.*, users.username from comments JOIN users ON comments.author_id = users.id WHERE post_id = ${req.params.id};`,
    (error, results, fields) => {
      if (error) throw error;
      res.status(200).send(results);
    }
  )
});

app.post('/post/:id/comments/new', (req, res) => {
  let {post_id, author_id, parent_id, content, creation_date_time, points} = req.body;
  if (creation_date_time.charAt(creation_date_time.length - 1) === 'Z') {
    creation_date_time = creation_date_time.substring(0, creation_date_time.length - 1);
  }
  connection.query(
    `INSERT INTO comments (post_id, author_id, parent_id, content, creation_date_time, points)
    VALUES(${post_id}, ${author_id}, ${parent_id}, "${content}", CAST("${creation_date_time}" AS DATETIME), ${points});`,
    (error, results, fields) => {
      if (error) throw error;
      res.status(200).send(results);
    }
  )
});

app.post('/post/new', (req, res) => {
  let {author_id, title, content, creation_date_time, points} = req.body;
  if (creation_date_time.charAt(creation_date_time.length - 1) === 'Z') {
    creation_date_time = creation_date_time.substring(0, creation_date_time.length - 1);
  }

  connection.query(
    `INSERT INTO posts (author_id, title, content, creation_date_time, points)
    VALUES(${author_id}, "${title}", "${content}", CAST("${creation_date_time}" AS DATETIME), ${points});`,
    (error, results, fields) => {
      if (error) throw error;
      res.status(200).send(results);
    });
});

app.post('/comment', (req, res) => {
  let {post_id, parent_comment_id, author_id, content, created_at, points} = req.body;
  if (created_at.charAt(created_at.length - 1) === 'Z') {
    created_at = created_at.substring(0, created_at.length - 1);
  }

  connection.query(
    `INSERT INTO comments (post_id, parent_comment_id, author_id, content, created_at, points)
    VALUES(${post_id}, ${parent_comment_id}, ${author_id}, "${content}", CAST("${created_at}" AS DATETIME), ${points});`,
    (error, results, fields) => {
      if (error) throw error;
      res.status(200).send(results);
    });
});

app.listen(5000);