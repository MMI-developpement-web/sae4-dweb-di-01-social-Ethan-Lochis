<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260320114303 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE Subsciptions (user_source INT NOT NULL, user_target INT NOT NULL, INDEX IDX_D3942CE43AD8644E (user_source), INDEX IDX_D3942CE4233D34C1 (user_target), PRIMARY KEY (user_source, user_target)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE Subsciptions ADD CONSTRAINT FK_D3942CE43AD8644E FOREIGN KEY (user_source) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE Subsciptions ADD CONSTRAINT FK_D3942CE4233D34C1 FOREIGN KEY (user_target) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE Subsciptions DROP FOREIGN KEY FK_D3942CE43AD8644E');
        $this->addSql('ALTER TABLE Subsciptions DROP FOREIGN KEY FK_D3942CE4233D34C1');
        $this->addSql('DROP TABLE Subsciptions');
    }
}
