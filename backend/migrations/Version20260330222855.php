<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260330222855 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE hashtag (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(50) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE hashtag_post (hashtag_id INT NOT NULL, post_id INT NOT NULL, INDEX IDX_EFB38414FB34EF56 (hashtag_id), INDEX IDX_EFB384144B89032C (post_id), PRIMARY KEY (hashtag_id, post_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE hashtag_post ADD CONSTRAINT FK_EFB38414FB34EF56 FOREIGN KEY (hashtag_id) REFERENCES hashtag (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE hashtag_post ADD CONSTRAINT FK_EFB384144B89032C FOREIGN KEY (post_id) REFERENCES post (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user ADD pinned_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D6494CEFB132 FOREIGN KEY (pinned_id) REFERENCES post (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D6494CEFB132 ON user (pinned_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE hashtag_post DROP FOREIGN KEY FK_EFB38414FB34EF56');
        $this->addSql('ALTER TABLE hashtag_post DROP FOREIGN KEY FK_EFB384144B89032C');
        $this->addSql('DROP TABLE hashtag');
        $this->addSql('DROP TABLE hashtag_post');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D6494CEFB132');
        $this->addSql('DROP INDEX UNIQ_8D93D6494CEFB132 ON user');
        $this->addSql('ALTER TABLE user DROP pinned_id');
    }
}
