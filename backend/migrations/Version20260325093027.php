<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260325093027 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comments ADD comment_of_id INT NOT NULL');
        $this->addSql('ALTER TABLE comments ADD CONSTRAINT FK_5F9E962AF3973B8D FOREIGN KEY (comment_of_id) REFERENCES post (id)');
        $this->addSql('CREATE INDEX IDX_5F9E962AF3973B8D ON comments (comment_of_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE comments DROP FOREIGN KEY FK_5F9E962AF3973B8D');
        $this->addSql('DROP INDEX IDX_5F9E962AF3973B8D ON comments');
        $this->addSql('ALTER TABLE comments DROP comment_of_id');
    }
}
