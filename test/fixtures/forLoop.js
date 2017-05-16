var i;
for(i=0; i<5; i++) console.log(i);
for(var j=3; j; j--) { console.log(j); }
for(var j=1,k=2; ok(j); ++j, k++) { console.log(j, k); }
function ok(x) { return x < 3; }
i=3;
for(;i;i--) console.log(i);
for(i=0;;i++) {
  if (i == 5) break;
  if (i == 3) continue;
  console.log(i);
}
for(i=0;;) { console.log(i); break; }
