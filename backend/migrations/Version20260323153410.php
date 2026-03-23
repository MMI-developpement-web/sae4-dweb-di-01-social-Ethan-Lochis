<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260323153410 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE likes (post_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_49CA4E7D4B89032C (post_id), INDEX IDX_49CA4E7DA76ED395 (user_id), PRIMARY KEY (post_id, user_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE Subscriptions (follower_id INT NOT NULL, following_id INT NOT NULL, INDEX IDX_B709C1F4AC24F853 (follower_id), INDEX IDX_B709C1F41816E3A3 (following_id), PRIMARY KEY (follower_id, following_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE likes ADD CONSTRAINT FK_49CA4E7D4B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE likes ADD CONSTRAINT FK_49CA4E7DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE Subscriptions ADD CONSTRAINT FK_B709C1F4AC24F853 FOREIGN KEY (follower_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE Subscriptions ADD CONSTRAINT FK_B709C1F41816E3A3 FOREIGN KEY (following_id) REFERENCES user (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_7BA2F5EB5F37A13B ON api_token (token)');
        $this->addSql('ALTER TABLE user ADD is_blocked TINYINT NOT NULL');
        $this->addSql('ALTER TABLE user RENAME INDEX uniq_identifier_email TO UNIQ_8D93D649E7927C74');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE likes DROP FOREIGN KEY FK_49CA4E7D4B89032C');
        $this->addSql('ALTER TABLE likes DROP FOREIGN KEY FK_49CA4E7DA76ED395');
        $this->addSql('ALTER TABLE Subscriptions DROP FOREIGN KEY FK_B709C1F4AC24F853');
        $this->addSql('ALTER TABLE Subscriptions DROP FOREIGN KEY FK_B709C1F41816E3A3');
        $this->addSql('DROP TABLE likes');
        $this->addSql('DROP TABLE Subscriptions');
        $this->addSql('DROP INDEX UNIQ_7BA2F5EB5F37A13B ON api_token');
        $this->addSql('ALTER TABLE user DROP is_blocked');
        $this->addSql('ALTER TABLE user RENAME INDEX uniq_8d93d649e7927c74 TO UNIQ_IDENTIFIER_EMAIL');
    }
}
