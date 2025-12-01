-- CreateTable
CREATE TABLE "_EventDeclines" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_EventDeclines_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventDeclines_B_index" ON "_EventDeclines"("B");

-- AddForeignKey
ALTER TABLE "_EventDeclines" ADD CONSTRAINT "_EventDeclines_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventDeclines" ADD CONSTRAINT "_EventDeclines_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
