<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260313092836 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE post (id INT AUTO_INCREMENT NOT NULL, text_content VARCHAR(510) NOT NULL, created_at DATETIME NOT NULL, author_id INT NOT NULL, INDEX IDX_5A8A6C8DF675F31B (author_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, username VARCHAR(22) NOT NULL, email VARCHAR(255) NOT NULL, password VARCHAR(500) NOT NULL, profile_picture VARCHAR(500) NOT NULL, roles JSON NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE post ADD CONSTRAINT FK_5A8A6C8DF675F31B FOREIGN KEY (author_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE posts DROP FOREIGN KEY `FK_885DBAFAF675F31B`');
        $this->addSql('DROP TABLE posts');
        $this->addSql('DROP TABLE users');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE posts (id INT AUTO_INCREMENT NOT NULL, text_content VARCHAR(510) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_0900_ai_ci`, created_at DATETIME NOT NULL, author_id INT NOT NULL, INDEX IDX_885DBAFAF675F31B (author_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_0900_ai_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE users (id INT AUTO_INCREMENT NOT NULL, username VARCHAR(20) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_0900_ai_ci`, email VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_0900_ai_ci`, password VARCHAR(500) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_0900_ai_ci`, profile_pic VARCHAR(500) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_0900_ai_ci`, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_0900_ai_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE posts ADD CONSTRAINT `FK_885DBAFAF675F31B` FOREIGN KEY (author_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE post DROP FOREIGN KEY FK_5A8A6C8DF675F31B');
        $this->addSql('DROP TABLE post');
        $this->addSql('DROP TABLE user');
    }
}
