
import asyncio
import threading
import time

def run_async_task_simulation(should_fail=False):
    print(f"Starting simulation (should_fail={should_fail})")
    
    async def task():
        print("Inside async task")
        if should_fail:
            raise ValueError("Simulated failure in async task")
        print("Async task finished")

    def thread_target():
        try:
            asyncio.run(task())
        except Exception as e:
            print(f"Caught exception inside thread: {e}")
            # In the original code, this just crashes the thread and nobody knows

    thread = threading.Thread(target=thread_target)
    thread.start()
    thread.join()
    print("Thread joined. Returning to main flow.")

print("--- Test 1: Success case ---")
run_async_task_simulation(False)

print("\n--- Test 2: Failure case ---")
run_async_task_simulation(True)
print("Main flow continued! Exception was swallowed.")
