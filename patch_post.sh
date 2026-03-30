cat frontend/src/components/ui/Post.tsx | awk '
/if \(isEditing\) \{/ {
  print "  if (isEditing) {"
  print "    return ("
  print "      <div className=\"flex flex-col gap-2 p-4 bg-bg-lighter rounded-xl\">"
  print "        <div className=\"flex items-center gap-3\">"
  print "          <Publisher"
  print "            username={username}"
  print "            avatarUrl={avatarUrl || `https://ui-avatars.com/api/?name=${username}&background=random`}"
  print "            className={avatarVariants({ size: isReply ? \"reply\" : \"default\" })}"
  print "          />"
  print "        </div>"
  print "        <div className=\"flex flex-col gap-1 w-full relative\">"
  print "          <Posting"
  print "            variant={isReply ? \"comment\" : \"post\"}"
  print "            isEditing={true}"
  print "            editPostId={id!}"
  print "            initialContent={text}"
  print "            initialMediaUrl={mediaUrl}"
  print "            onPostEdited={handlePostEdited}"
  print "            onCancelEdit={() => setIsEditing(false)}"
  print "          />"
  print "        </div>"
  print "      </div>"
  print "    );"
  print "  }"
  skip=1
}
skip && /return \(/ {skip=0}
!skip {print $0}
' > frontend/src/components/ui/Post.tmp.tsx && mv frontend/src/components/ui/Post.tmp.tsx frontend/src/components/ui/Post.tsx
