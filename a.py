i = int(input())
for x in range(i):
    n = int(input())
    a = map(int,input().split(' '))
    a.sort()
    ans = 0
    cur = 1
    for y in range(len(a)):
        if (a[y] >= cur):
            ans += 1
            cur += 1
    print("Case #"+str(x+1),ans)



