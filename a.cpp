#include <cstdio>
#include <algorithm>
using namespace std;

int a[100100], N;

int main () {
    int t;
    scanf("%d", &t);
    for (int z = 1; z <=t ; z++) {
        scanf("%d", &N);
        for (int i = 0; i < N; i++) scanf("%d", &a[i]);
        
        int x = 0;
        
        sort(a, a+N);
        
        for (int i = 0; i < N; i++) {
            if (a[i] > x) x++;
        }
        printf("Case #%d: %d\n", z, x);
    
    }
    return 0;
    
}
